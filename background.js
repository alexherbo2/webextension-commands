const commands = {}

// Zoom

commands['zoom-in'] = (step = 0.1) => {
  chrome.tabs.getZoom(undefined, (zoomFactor) => {
    chrome.tabs.setZoom(undefined, zoomFactor + step)
  })
}

commands['zoom-out'] = (step = 0.1) => {
  commands['zoom-in'](-step)
}

commands['zoom-reset'] = () => {
  chrome.tabs.setZoom(undefined, 0)
}

// Open URLs
commands['open'] = (url) => {
  chrome.tabs.update(undefined, { url })
}

commands['download'] = (url) => {
  chrome.downloads.download({ url })
}

// Create tabs

commands['new-tab'] = (url, background = Boolean(url)) => {
  chrome.tabs.create({ url, active: ! background })
}

commands['restore-tab'] = () => {
  chrome.sessions.restore()
}

commands['duplicate-tab'] = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    const [tab] = tabs
    chrome.tabs.duplicate(tab.id)
  })
}

// Create windows

commands['new-window'] = (url) => {
  chrome.windows.create({ url })
}

commands['new-incognito-window'] = () => {
  chrome.windows.create({ incognito: true })
}

// Close tabs

commands['close-tab'] = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    const [tab] = tabs
    chrome.tabs.remove(tab.id)
  })
}

commands['close-other-tabs'] = () => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    for (const tab of tabs) {
      if (tab.active === false) {
        chrome.tabs.remove(tab.id)
      }
    }
  })
}

commands['close-right-tabs'] = () => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const active = tabs.find((tab) => tab.active)
    const rightTabs = tabs.slice(active.index + 1)
    for (const tab of rightTabs) {
      chrome.tabs.remove(tab.id)
    }
  })
}

// Refresh tabs

commands['reload-tab'] = (bypassCache = false) => {
  chrome.tabs.reload(undefined, { bypassCache })
}

commands['reload-all-tabs'] = (bypassCache = false) => {
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      chrome.tabs.reload(tab.id, { bypassCache })
    }
  })
}

// Switch tabs

commands['next-tab'] = (count = 1) => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const active = tabs.find((tab) => tab.active)
    const next = tabs[modulo(active.index + count, tabs.length)]
    chrome.tabs.update(next.id, { active: true })
  })
}

commands['previous-tab'] = (count = 1) => {
  commands['next-tab'](-count)
}

commands['first-tab'] = () => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const first = tabs[0]
    chrome.tabs.update(first.id, { active: true })
  })
}

commands['last-tab'] = () => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const last = tabs[tabs.length - 1]
    chrome.tabs.update(last.id, { active: true })
  })
}

// Move tabs

commands['move-tab-right'] = (count = 1) => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const active = tabs.find((tab) => tab.active)
    const next = tabs[modulo(active.index + count, tabs.length)]
    chrome.tabs.move(active.id, { index: next.index })
  })
}

commands['move-tab-left'] = (count = 1) => {
  commands['move-tab-right'](-count)
}

commands['move-tab-first'] = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    const [tab] = tabs
    chrome.tabs.move(tab.id, { index: 0 })
  })
}

commands['move-tab-last'] = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    const [tab] = tabs
    chrome.tabs.move(tab.id, { index: -1 })
  })
}

// Detach tabs

commands['detach-tab'] = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    const [tab] = tabs
    const pinned = tab.pinned
    chrome.windows.create({ tabId: tab.id }, (window) => {
      chrome.tabs.update(tab.id, { pinned })
    })
  })
}

commands['attach-tab'] = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    const [tab] = tabs
    const pinned = tab.pinned
    chrome.tabs.query({ windowId: focusedWindows[focusedWindows.length - 2] }, (tabs) => {
      const target = tabs.find((tab) => tab.active)
      chrome.tabs.move(tab.id, { windowId: target.windowId, index: modulo(target.index + 1, tabs.length + 1) }, (tab) => {
        chrome.tabs.update(tab.id, { pinned })
      })
    })
  })
}

// Discard tabs

commands['discard-tab'] = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    const [tab] = tabs
    chrome.tabs.discard(tab.id)
  })
}

// Mute tabs

commands['mute-tab'] = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    const [tab] = tabs
    chrome.tabs.update(tab.id, { muted: ! tab.mutedInfo.muted })
  })
}

let muted = false

commands['mute-all-tabs'] = () => {
  muted = ! muted
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      chrome.tabs.update(tab.id, { muted })
    }
  })
}

// Pin tabs

commands['pin-tab'] = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    const [tab] = tabs
    chrome.tabs.update(tab.id, { pinned: ! tab.pinned })
  })
}

// Notifications

commands['notify'] = (id, options) => {
  const properties = {}
  properties.title = ''
  properties.message = ''
  properties.type = 'basic'
  properties.iconUrl = 'packages/chrome.svg'
  Object.assign(properties, options)
  chrome.notifications.getAll((notifications) => {
    const notification = notifications[id]
    if (notification) {
      chrome.notifications.update(id, properties)
    } else {
      chrome.notifications.create(id, properties)
    }
  })
}

const modulo = (dividend, divisor) => {
  return ((dividend % divisor) + divisor) % divisor
}

// Events ──────────────────────────────────────────────────────────────────────

const focusedWindows = []

chrome.windows.onFocusChanged.addListener((id) => {
  if (id !== chrome.windows.WINDOW_ID_NONE) {
    focusedWindows.push(id)
  }
  if (focusedWindows.length > 2) {
    focusedWindows.shift()
  }
})

// Initialization ──────────────────────────────────────────────────────────────

chrome.runtime.onConnectExternal.addListener((port) => {
  port.onMessage.addListener((request) => {
    const command = commands[request.command]
    const arguments = request.arguments || []
    if (command) {
      command(...arguments)
    }
  })
})
