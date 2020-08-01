/* global Module */

/* Magic Mirror
 * Module: MMM-social-counter
 *
 * By Niek Nijland <ngnijland@gmail.com>
 * MIT Licensed.
 */

Module.register('MMM-social-counter', {
  start: function () {
    Log.info(`Starting module: ${this.name}`);

    this.status = 'LOADING';
    this.error;

    this.twitter = this.config.twitter;

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

    this.sendSocketNotification('TWITTER_AUTHENTICATE', {
      accessToken: this.twitter.accessToken,
      accessTokenSecret: this.twitter.accessTokenSecret,
    });
  },

  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case 'TWITTER_AUTHENTICATED': {
        // TODO: make follower request
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
        this.error = `Unknown notification ${notification} received by node_helper. Please submit and issue in the MMM-social-counter repository.`;
        this.updateDom();
      }
    }
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
    title.textContent = 'Hello world';

    return title;
  },
});
