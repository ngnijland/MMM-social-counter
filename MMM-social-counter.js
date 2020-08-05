/* global Module */

/* Magic Mirror
 * Module: MMM-social-counter
 *
 * By Niek Nijland <ngnijland@gmail.com>
 * MIT Licensed.
 */

Module.register('MMM-social-counter', {
  defaults: {
    updatesEvery: 10,
  },

  start: function () {
    Log.info(`Starting module: ${this.name}`);

    this.error;
    this.twitterFollowers;
    this.status = 'LOADING';
    this.interval;
    this.twitter = this.config.twitter;
    this.updatesEvery = this.config.updatesEvery;

    if (typeof this.updatesEvery !== 'number') {
      Log.error(
        `Configuration error: "updatesEvery" should be a number, but is: "${this.updatesEvery}". Falling back to 1.`
      );
      this.updatesEvery = 1;
    } else if (this.updatesEvery < 1) {
      Log.error(
        `Configuration error: "updatesEvery" should be higher than 1, but is: "${this.updatesEvery}". Falling back to 1.`
      );
      this.updatesEvery = 1;
    }

    if (typeof this.twitter === 'undefined') {
      this.status = 'ERROR';
      this.error = 'Configuration error: No configurations found for twitter.';

      return;
    }

    if (typeof this.twitter.accessToken !== 'string') {
      this.status = 'ERROR';
      this.error =
        'Configuration error: No twitter accessToken set in configuration.';

      return;
    }

    if (typeof this.twitter.accessTokenSecret !== 'string') {
      this.status = 'ERROR';
      this.error =
        'Configuration error: No twitter accessTokenSecret set in configuration.';

      return;
    }

    if (typeof this.twitter.username !== 'string') {
      this.status = 'ERROR';
      this.error =
        'Configuration error: No twitter username set in configuration.';

      return;
    }

    this.sendSocketNotification('TWITTER_AUTHENTICATE', {
      accessToken: this.twitter.accessToken,
      accessTokenSecret: this.twitter.accessTokenSecret,
    });
  },

  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case 'TWITTER_AUTHENTICATED': {
        this.startInterval();
        break;
      }
      case 'TWITTER_FOLLOWERS_COUNT': {
        this.status = 'SUCCESS';
        this.twitterFollowers = payload;
        this.updateDom();
        break;
      }
      case 'TWITTER_TOKEN_INVALID_OR_EXPIRED': {
        this.sendSocketNotification('TWITTER_AUTHENTICATE', {
          accessToken: this.twitter.accessToken,
          accessTokenSecret: this.twitter.accessTokenSecret,
        });
        break;
      }
      case 'ERROR': {
        this.status = 'ERROR';
        this.error = payload;
        this.updateDom();
        break;
      }
      default: {
        this.status = 'ERROR';
        this.error = `Socket notivication error: Unknown notification "${notification}" received from node_helper. Please submit an issue in the MMM-social-counter repository.`;
        this.updateDom();
      }
    }
  },

  startInterval: function () {
    clearInterval(this.interval);

    this.interval = setInterval(() => {
      this.sendSocketNotification(
        'TWITTER_GET_FOLLOWERS_COUNT',
        this.twitter.username
      );
    }, this.updatesEvery * 1000);
  },

  getDom: function () {
    if (this.status === 'LOADING') {
      const title = document.createElement('h1');
      title.textContent = 'Loading...';

      return title;
    }

    if (this.status === 'ERROR') {
      Log.error(this.error);

      const title = document.createElement('h1');
      title.textContent = this.error;

      return title;
    }

    const title = document.createElement('h1');
    title.textContent = this.twitterFollowers;

    return title;
  },
});
