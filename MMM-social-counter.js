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
    const container = document.createElement('div');
    container.classList.add('container');

    const icon = document.createElement('img');
    icon.classList.add('icon');
    icon.src = this.file('static/icons/twitter.svg');

    const title = document.createElement('h1');
    title.classList.add(this.size);
    title.classList.add('bright');

    let iconSize;

    switch (this.size) {
      case 'small': {
        iconSize = '32px';
        break;
      }
      case 'large': {
        iconSize = '100px';
        break;
      }
      default: {
        iconSize = '46px';
      }
    }

    icon.style.height = iconSize;

    if (this.status === 'LOADING') {
      title.textContent = 'Loading...';

      return title;
    }

    if (this.status === 'ERROR') {
      Log.error(this.error);

      title.textContent = this.error;

      return title;
    }

    title.textContent = this.twitterFollowers;

    container.appendChild(icon);
    container.appendChild(title);

    return container;
  },

  getStyles: function () {
    return [this.file('css/MMM-social-counter.css')];
  },
});
