# Commands for [Chrome] and [Firefox]

[Chrome]: https://google.com/chrome/
[Firefox]: https://mozilla.org/firefox/

[WebExtension] API to perform browser actions, such as opening a new tab.

[WebExtension]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions

## Dependencies

- [jq]
- [Zip]

[jq]: https://stedolan.github.io/jq/
[Zip]: http://infozip.sourceforge.net/Zip.html

## Installation

###### Chrome

``` sh
make chrome
```

Open the _Extensions_ page by navigating to `chrome://extensions`, enable _Developer mode_ then _Load unpacked_ to select the extension directory: `target/chrome`.

###### Firefox

``` sh
make firefox
```

- Open `about:config`, change `xpinstall.signatures.required` to `false`.
- Open `about:addons` ❯ _Extensions_, click _Install add-on from file_ and select the package file: `target/firefox/package.zip`.

## Usage

``` javascript
// Environment variables
switch (true) {
  case (typeof browser !== 'undefined'):
    var PLATFORM = 'firefox'
    var COMMANDS_EXTENSION_ID = 'commands@alexherbo2.github.com'
    break
  case (typeof chrome !== 'undefined'):
    var PLATFORM = 'chrome'
    var COMMANDS_EXTENSION_ID = 'cabmgmngameccclicfmcpffnbinnmopc'
    break
}

// Initialization
const commands = {}
commands.port = chrome.runtime.connect(COMMANDS_EXTENSION_ID)
commands.send = (command, ...arguments) => {
  commands.port.postMessage({ command, arguments })
}

// Usage
commands.send('new-tab', 'https://github.com')
```

You can find some examples in [Krabby].

[Krabby]: https://krabby.netlify.com

See the [source](src) for a complete reference.
