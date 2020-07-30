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

    this.updateDom();
  },

  getDom: function () {
    const title = document.createElement('h1');
    title.textContent = 'Hello world';

    return title;
  },
});
