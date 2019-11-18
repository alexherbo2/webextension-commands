# Commands for [Chrome]

###### [Chrome](#chrome) | [Firefox](#firefox)

> Chrome API to perform browser actions, such as opening a new tab.

## Dependencies

- [Zip] (Zip is used to package the extension)
- [Inkscape] (Inkscape is used to convert SVG to PNG when uploading the extension)

## Installation

### Chrome

#### Installing from the Chrome Web Store

https://chrome.google.com/webstore/detail/commands/cabmgmngameccclicfmcpffnbinnmopc

#### Installing from the source

``` sh
make chrome
```

Open the _Extensions_ page by navigating to `chrome://extensions`, enable _Developer mode_ then _Load unpacked_ to select the extension directory: `target/chrome`.

![Load extension](https://developer.chrome.com/static/images/get_started/load_extension.png)

See the [Getting Started Tutorial] for more information.

### Firefox

``` sh
make firefox
```

- Open `about:config`, change `xpinstall.signatures.required` to `false`.
- Open `about:addons` ❯ _Extensions_, click _Install add-on from file_ and select the package file: `target/firefox/package.zip`.

#### Developing

Open `about:debugging` ❯ _This Firefox_ ❯ _Temporary extensions_, click _Load temporary add-on_ and select the manifest file: `target/firefox/manifest.json`.

[![Load extension](https://img.youtube.com/vi_webp/cer9EUKegG4/maxresdefault.webp)](https://youtu.be/cer9EUKegG4)

See [Firefox – Your first extension] for more information.

## Usage

``` javascript
const port = chrome.runtime.connect('cabmgmngameccclicfmcpffnbinnmopc') // for a Chrome extension
const port = chrome.runtime.connect('commands@alexherbo2.github.com') // for a Firefox extension
port.postMessage({ command: 'new-tab', arguments: ['https://developer.chrome.com/extensions'] })
```

The full list of commands can be found [here](background.js) alongside with some examples at [Krabby].

See [Cross-extension messaging] for more details.

## References

- [Create a keyboard interface to the web]

[Chrome]: https://google.com/chrome/
[Chrome Web Store]: https://chrome.google.com/webstore

[Firefox]: https://mozilla.org/firefox/
[Firefox Add-ons]: https://addons.mozilla.org

[Zip]: http://infozip.sourceforge.net/Zip.html
[Inkscape]: https://inkscape.org

[Getting Started Tutorial]: https://developer.chrome.com/extensions/getstarted
[Cross-extension messaging]: https://developer.chrome.com/extensions/messaging#external

[Firefox – Your first extension]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension

[Krabby]: https://krabby.netlify.com
[Create a keyboard interface to the web]: https://alexherbo2.github.io/blog/chrome/create-a-keyboard-interface-to-the-web/
