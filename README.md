# Commands for [Chrome]

> Chrome API to perform browser actions, such as opening a new tab.

## Dependencies

- [Inkscape] (Inkscape is used to convert SVG to PNG)

## Installation

### Installing from the Chrome Web Store

https://chrome.google.com/webstore/detail/commands/cabmgmngameccclicfmcpffnbinnmopc

### Installing from the source

``` sh
make
```

Open the _Extensions_ page by navigating to `chrome://extensions`, enable _Developer mode_ then _Load unpacked_ to select the extension directory.

![Load extension](https://developer.chrome.com/static/images/get_started/load_extension.png)

See the [Getting Started Tutorial] for more information.

## Usage

``` javascript
const port = chrome.runtime.connect('cabmgmngameccclicfmcpffnbinnmopc')
port.postMessage({ command: 'new-tab', arguments: ['https://developer.chrome.com/extensions'] })
```

The full list of commands can be found [here](background.js) alongside with [some examples][Create a keyboard interface to the web].

See [Cross-extension messaging] for more details.

[Chrome]: https://google.com/chrome/
[Create a keyboard interface to the web]: https://alexherbo2.github.io/blog/chrome/create-a-keyboard-interface-to-the-web/
[Getting Started Tutorial]: https://developer.chrome.com/extensions/getstarted
[Cross-extension messaging]: https://developer.chrome.com/extensions/messaging#external
[Inkscape]: https://inkscape.org
