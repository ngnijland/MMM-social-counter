const https = require('https');
const NodeHelper = require('node_helper');
const querystring = require('querystring');

module.exports = NodeHelper.create({
  start: function () {
    this.jwt;
  },

  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case 'TWITTER_AUTHENTICATE': {
        this.twitterAuthenticate(payload);
        break;
      }
      case 'TWITTER_GET_FOLLOWERS_COUNT': {
        this.twitterGetFollowers(payload);
        break;
      }
      default: {
        this.sendSocketNotification(
          'ERROR',
          `Socket notification error: Unknown notification "${notification}" received from module. Please submit an issue in the MMM-social-counter repository.`
        );
      }
    }
  },

  twitterAuthenticate: function ({ apiKey, apiKeySecret }) {
    const req = https
      .request(
        {
          auth: `${apiKey}:${apiKeySecret}`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Content-Length': 29,
          },
          hostname: 'api.twitter.com',
          method: 'POST',
          path: '/oauth2/token',
        },
        (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            const response = JSON.parse(data);

            if (typeof response.errors === 'undefined') {
              this.jwt = response.access_token;
              this.sendSocketNotification('TWITTER_AUTHENTICATED');
            } else {
              const { code, message } = response.errors[0];
              if (code === 99) {
                this.sendSocketNotification(
                  'ERROR',
                  'Authentication error: Looks like your twitter credentials are invalid, please check your access tokens in the config file.'
                );
              } else {
                this.sendSocketNotification(
                  'ERROR',
                  `Code: ${code}, message: ${message}`
                );
              }
            }
          });
        }
      )
      .on('error', (error) => {
        this.sendSocketNotification('ERROR', error.message);
      });

    req.write(
      querystring.stringify({
        grant_type: 'client_credentials',
      })
    );

    req.end();
  },

  twitterGetFollowers: function (username) {
    https
      .get(
        {
          hostname: 'api.twitter.com',
          path: `/1.1/users/show.json?screen_name=${username}`,
          headers: {
            Authorization: `Bearer ${this.jwt}`,
          },
        },
        (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            const response = JSON.parse(data);

            if (typeof response.errors === 'undefined') {
              this.sendSocketNotification(
                'TWITTER_FOLLOWERS_COUNT',
                response.followers_count
              );
            } else {
              const { code, message } = response.errors[0];

              if (code === 89) {
                this.sendSocketNotification('TWITTER_TOKEN_INVALID_OR_EXPIRED');
              } else {
                this.sendSocketNotification(
                  'ERROR',
                  `Code: ${code}, message: ${message}`
                );
              }
            }
          });
        }
      )
      .on('error', (error) => {
        this.sendSocketNotification('ERROR', error.message);
      });
  },
});
