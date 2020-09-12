# MMM-social-counter

This MagicMirror module is a twitter follower counter.

![Screenshot of module](https://github.com/ngnijland/MMM-social-counter/raw/master/screenshots/MMM-social-counter-screenshot.png)

## Installation

1. Go to the MagicMirror modules folder

```bash
cd ~/MagicMirror/modules
```

2. Clone this repository

```bash
git clone https://github.com/ngnijland/MMM-social-counter.git
```

3. Add this module to the modules array in the MagicMirror `config/config.js` file, like this:

```javascript
modules: [
  {
    module: "MMM-social-counter",
    position: "middle_center"
  }
]
```

## Twitter

To show the follower count of a Twitter user you need an app in the Twitter Developer Portal.

1. Go to: https://developer.twitter.com/

2. Log into your Twitter account

3. Go to the apps overview in the `Developer Portal` (https://developer.twitter.com/en/portal/projects-and-apps)

4. Create a new app

5. Add the `API key` and `API key secret` to the config of this module as follows:

```javascript
modules: [
  {
    module: "MMM-social-counter",
    position: "middle_center",
    config: {
      twitter: {
        apiKey: '<YOUR API KEY>',
        apiKeySecret: '<YOUR API KEY SECRET>',
        username: '<TWITTER USERNAME TO SHOW FOLLOWER COUNT OF>'
      }
    }
  }
]
```

## Configuration

Configure this module in your MagicMirror config file which is located at `config/config.js` in the MagicMirror repository. An example config for this module:

```javascript
modules: [
  {
    module: "MMM-social-counter",
    position: "middle_center",
    config: {
      // Options
    }
  }
]
```

The following configurations are available:

Config                | Type                       | Default value | Description
:---------------------|:---------------------------|:--------------|:------------
`size`                | `small \| medium \| large` | `medium`      | The size of the counter
`icon`                | `string                    | `fa-twitter`  | The font name (from FontAwesome) to display next to the follower count, e.g. fa-twitter-square
`updatesEvery`        | `number`                   | `10`          | The number of seconds between each follower count update
