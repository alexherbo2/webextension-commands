// State ───────────────────────────────────────────────────────────────────────

const state = {}
state.focusedWindowIds = []

chrome.windows.onFocusChanged.addListener((windowId) => {
  // Skip WINDOW_ID_NONE
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    return
  }
  // Skip duplicates
  const lastFocusedWindowId = state.focusedWindowIds[state.focusedWindowIds.length - 1]
  if (windowId === lastFocusedWindowId) {
    return
  }
  // Add the last focused window
  state.focusedWindowIds.push(windowId)
  // Keep the last two focused windows
  state.focusedWindowIds = state.focusedWindowIds.slice(-2)
})

// External ────────────────────────────────────────────────────────────────────

// Cross-extension messaging
// https://developer.chrome.com/extensions/messaging#external
//
// Entry point: Listen for incoming requests.
// Each request has the following format:
// {
//   command: String,
//   arguments: Array
// }
chrome.runtime.onConnectExternal.addListener((port) => {
  port.onMessage.addListener((request) => {
    const command = commands[request.command]
    const arguments = request.arguments || []
    const self = {
      port
    }
    if (command) {
      command.apply(self, arguments)
    }
  })
})

// Commands ────────────────────────────────────────────────────────────────────

const commands = {}

// Get platform ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

commands['get-platform'] = function() {
  chrome.runtime.getPlatformInfo((platformInfo) => {
    this.port.postMessage({
      id: 'get-platform',
      platform: platformInfo
    })
  })
}

// Zoom ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

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

// Open URLs ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

commands['open'] = (url) => {
  chrome.tabs.update(undefined, { url })
}

commands['download'] = (url) => {
  chrome.downloads.download({ url })
}

// Create tabs ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

commands['new-tab'] = (url) => {
  const active = url ? false : true
  chrome.tabs.create({ url, active })
}

// New tab to the right
commands['new-tab-right'] = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, ([openerTab]) => {
    chrome.tabs.create({
      index: openerTab.index + 1
    })
  })
}

commands['restore-tab'] = () => {
  chrome.sessions.restore()
}

commands['duplicate-tab'] = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, ([tab]) => {
    chrome.tabs.duplicate(tab.id)
  })
}

// Create windows ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

commands['new-window'] = (url) => {
  chrome.windows.create({ url })
}

commands['new-incognito-window'] = () => {
  chrome.windows.create({ incognito: true })
}

// Close tabs ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

commands['close-tab'] = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, ([tab]) => {
    chrome.tabs.remove(tab.id)
  })
}

commands['close-other-tabs'] = () => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const otherTabIds = tabs.flatMap((tab) => tab.active ? [] : [tab.id])
    chrome.tabs.remove(otherTabIds)
  })
}

commands['close-right-tabs'] = () => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const activeTab = tabs.find((tab) => tab.active)
    const rightTabs = tabs.slice(activeTab.index + 1)
    const rightTabIds = rightTabs.map((tab) => tab.id)
    chrome.tabs.remove(rightTabIds)
  })
}

// Refresh tabs ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

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

// Switch tabs ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

commands['next-tab'] = (count = 1) => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const activeTab = tabs.find((tab) => tab.active)
    const nextTabIndex = modulo(activeTab.index + count, tabs.length)
    const nextTab = tabs[nextTabIndex]
    chrome.tabs.update(nextTab.id, { active: true })
  })
}

commands['previous-tab'] = (count = 1) => {
  commands['next-tab'](-count)
}

commands['first-tab'] = () => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const firstTab = tabs[0]
    chrome.tabs.update(firstTab.id, { active: true })
  })
}

commands['last-tab'] = () => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const lastTab = tabs[tabs.length - 1]
    chrome.tabs.update(lastTab.id, { active: true })
  })
}

// Move tabs ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

commands['move-tab-right'] = (count = 1) => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const activeTab = tabs.find((tab) => tab.active)
    const nextTabIndex = modulo(activeTab.index + count, tabs.length)
    const nextTab = tabs[nextTabIndex]
    chrome.tabs.move(activeTab.id, { index: nextTab.index })
  })
}

commands['move-tab-left'] = (count = 1) => {
  commands['move-tab-right'](-count)
}

commands['move-tab-first'] = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, ([tab]) => {
    chrome.tabs.move(tab.id, { index: 0 })
  })
}

commands['move-tab-last'] = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, ([tab]) => {
    chrome.tabs.move(tab.id, { index: -1 })
  })
}

// Detach tabs ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

commands['detach-tab'] = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, ([tab]) => {
    const pinned = tab.pinned
    chrome.windows.create({ tabId: tab.id }, (window) => {
      chrome.tabs.update(tab.id, { pinned })
    })
  })
}

commands['attach-tab'] = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, ([tab]) => {
    const pinned = tab.pinned
    const lastFocusedWindowId = state.focusedWindowIds[state.focusedWindowIds.length - 2]
    chrome.tabs.query({ windowId: lastFocusedWindowId }, (tabs) => {
      const targetTab = tabs.find((tab) => tab.active)
      const targetedTabIndex = modulo(targetTab.index + 1, tabs.length + 1)
      chrome.tabs.move(tab.id, { windowId: targetTab.windowId, index: targetedTabIndex }, (tab) => {
        chrome.tabs.update(tab.id, { pinned })
      })
    })
  })
}

// Discard tabs ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

commands['discard-tab'] = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, ([tab]) => {
    chrome.tabs.discard(tab.id)
  })
}

// Mute tabs ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

commands['mute-tab'] = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, ([tab]) => {
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

// Pin tabs ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

commands['pin-tab'] = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, ([tab]) => {
    chrome.tabs.update(tab.id, { pinned: ! tab.pinned })
  })
}

// Notifications ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

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

// Helpers ─────────────────────────────────────────────────────────────────────

const modulo = (dividend, divisor) => {
  return ((dividend % divisor) + divisor) % divisor
}
