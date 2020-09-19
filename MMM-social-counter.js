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
    size: 'medium',
    icon: 'fa-twitter',
  },

  start: function () {
    Log.info(`Starting module: ${this.name}`);

    this.error;
    this.twitterFollowers;
    this.status = 'LOADING';
    this.interval;
    this.twitter = this.config.twitter;
    this.updatesEvery = this.config.updatesEvery;
    this.size = this.config.size;
    this.icon = this.config.icon;
    this.position = this.data.position;

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

    if (
      this.size !== 'small' &&
      this.size !== 'medium' &&
      this.size !== 'large'
    ) {
      Log.error(
        `"${this.size}" is not a supported value. Please use "small", "medium" or "large". Falling back to "medium".`
      );
      this.size = 'medium';
    }

    if (typeof this.twitter === 'undefined') {
      this.status = 'ERROR';
      this.error = 'Configuration error: No configurations found for twitter.';

      return;
    }

    if (typeof this.twitter.apiKey !== 'string') {
      this.status = 'ERROR';
      this.error =
        'Configuration error: No twitter apiKey set in configuration.';

      return;
    }

    if (typeof this.twitter.apiKeySecret !== 'string') {
      this.status = 'ERROR';
      this.error =
        'Configuration error: No twitter apiKeySecret set in configuration.';

      return;
    }

    if (typeof this.twitter.username !== 'string') {
      this.status = 'ERROR';
      this.error =
        'Configuration error: No twitter username set in configuration.';

      return;
    }

    this.sendSocketNotification('TWITTER_AUTHENTICATE', {
      apiKey: this.twitter.apiKey,
      apiKeySecret: this.twitter.apiKeySecret,
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
          apiKey: this.twitter.apiKey,
          apiKeySecret: this.twitter.apiKeySecret,
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

    this.sendSocketNotification(
      'TWITTER_GET_FOLLOWERS_COUNT',
      this.twitter.username
    );

    this.interval = setInterval(() => {
      this.sendSocketNotification(
        'TWITTER_GET_FOLLOWERS_COUNT',
        this.twitter.username
      );
    }, this.updatesEvery * 1000);
  },

  getDom: function () {
    const wrapper = document.createElement('div');
    wrapper.className = `wrapper ${this.size}`;

    let justifyContent;

    if (this.position.includes('right')) {
      justifyContent = 'flex-end';
    } else if (this.position.includes('center')) {
      justifyContent = 'center';
    } else {
      justifyContent = 'flex-start';
    }

    wrapper.style.justifyContent = justifyContent;

    const text = document.createElement('span');
    text.classList.add('bright');
    text.classList.add('text');

    if (this.status === 'LOADING') {
      text.textContent = 'Loading...';

      return text;
    }

    if (this.status === 'ERROR') {
      Log.error(this.error);

      text.textContent = this.error;

      return text;
    }

    const icon = document.createElement('i');
    icon.className = 'fa ' + this.icon + ' icon';

    text.textContent = this.twitterFollowers;

    wrapper.appendChild(icon);
    wrapper.appendChild(text);

    return wrapper;
  },

  getStyles: function () {
    return [this.file('css/MMM-social-counter.css')];
  },
});
