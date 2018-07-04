export function authenticate (password) {
  return { type: 'AUTHENTICATE_REQUESTED', payload: { password } }
}

export function clearPasswordUpdated () {
  return { type: 'CLEAR_PASSWORD_UPDATED' }
}

export function checkAuthenticated () {
  const authorization = localStorage.getItem('admin-authorization')

  if (authorization) {
    const parts = authorization.split(' ')
    if (parts.length === 2) {
      const decoded = atob(parts[1])
      const creds = decoded.split(':')
      if (creds.length === 2) {
        return { type: 'AUTHENTICATE_REQUESTED', payload: { password: creds[1] } }
      }
    }
  }
  return { type: 'AUTHENTICATE_REQUESTED', payload: { password: '' } }
}

export function setProperty (propertyName, propertyValue, wrap = true, requestTimeout, maxWait, callback) {
  return { type: 'SET_PROPERTY_REQUESTED', payload: {propertyName, propertyValue, wrap, requestTimeout, maxWait, callback} }
}

export function getProperty (propertyName, callback) {
  return { type: 'GET_PROPERTY_REQUESTED', payload: {propertyName, callback}}
}

export function triggerEvent (propertyName, eventType, callback) {
  return { type: 'TRIGGER_EVENT_REQUESTED', payload: {propertyName, eventType, callback}}
}

export function getContent (contentPath, callback) {
  return { type: 'CONTENT_FETCH_REQUESTED', payload: { contentPath, callback } }
}

export function sendMessage (message, callback) {
  return { type: 'MESSAGE_SEND_REQUESTED', message }
}

export function getMessages (callback) {
  return { type: 'MESSAGES_FETCH_REQUESTED' }
}

export function fetchNick (callback) {
  return { type: 'FETCH_NICK_REQUESTED' }
}

export function saveNick (nick, callback) {
  return { type: 'SAVE_NICK_REQUESTED', nick }
}

export function fetchTextDirection (callback) {
  return { type: 'FETCH_TEXT_DIRECTION_REQUESTED' }
}

export function saveTextDirection (textDirection, callback) {
  return { type: 'SAVE_TEXT_DIRECTION_REQUESTED', textDirection }
}

export function getNewMessages (callback) {
  return { type: 'NEW_MESSAGES_FETCH_REQUESTED' }
}

export function setConfigPath (configPath, callback) {
  let path = configPath
  if (!path) {
    path = `${process.env.PUBLIC_URL}/config/default.json`
  }
  return { type: 'SET_CONFIG_PATH', payload: {configPath: path} }
}

export function clearMessageNotifications (callback) {
  return { type: 'CLEAR_MESSAGE_NOTIFICATIONS' }
}

export function toggleChatPanel (showing, callback) {
  return { type: 'TOGGLE_CHAT_PANEL', showing }
}

export const initialState = {
  error: undefined,
  contentPath: '',
  content: undefined
}

const fileExtension = (fname) => {
  return fname.substr((~-fname.lastIndexOf('.') >>> 0) + 2)
}

const parseIcoMetadata = (prefix, filename, dirMap) => {
  let ext = fileExtension(filename)

  const metadata = filename.substring(prefix.length)

  if (ext) {
    let dirName = metadata.substring(0, metadata.lastIndexOf('.'))
    if (dirMap[dirName]) {
      let dir = dirMap[dirName]
      dir.icon_file = filename
    }
  } else {
    let parts = metadata.split('_')
    let dirName = parts[0]
    let ico = parts[1]

    if (dirMap[dirName]) {
      let dir = dirMap[dirName]
      dir.icon_class = ico.startsWith('fa-') ? ico : `fa-${ico}`
    }
  }
}

const postProcessContent = (content, contentPath, state) => {
  const {config} = state
  const isTopLevel = contentPath === '' || contentPath === '/'
  const dirMap = {}
  content.map((f) => {
    f.isTopLevel = isTopLevel
    f.mtime = new Date(f.mtime)
    if (f.type === 'file') {
      f.ext = fileExtension(f.name)
      if (f.isTopLevel) {
        f.isTopLevel = false
      }
    } else {
      dirMap[f.name] = f
    }

    return f
  })

  const excludeFilters = config.Client.excluded_files ? config.Client.excluded_files.map((pattern) => {
    return RegExp(pattern, 'i')
  }) : []

  excludeFilters.push(/^\..*/)
  // Remove excluded files
  let files = content.filter((f) => {
    const excluded = excludeFilters.reduce((a, b) => a || RegExp(b).test(f.name), false)
    if (excluded) {
      return false
    }

    if (f.name.startsWith(config.Client.icon_prefix)) {
      parseIcoMetadata(config.Client.icon_prefix, f.name, dirMap)
      return false
    } else {
      return true
    }
  })

  let topLevelFiles = null
  if (isTopLevel) {
    topLevelFiles = files.filter(f => f.type === 'file')
    files = files.filter(f => f.type === 'directory')
  }

  return [files, topLevelFiles]
}

const postProcessStats = (stats) => {
  let popularFiles = []
  let max = 0
  let min = 2147483647
  popularFiles = ((stats && stats['year']) || []).map(function (f) {
    var resource = f.resource
    var parts = resource.split('/')
    f.name = decodeURIComponent(parts[parts.length - 1])
    f.ext = fileExtension(f.name)
    if (f.count > max) {
      max = f.count
    }
    if (f.count < min) {
      min = f.count
    }
    return f
  })

  var maxMin = (max - min)
  if (maxMin <= 0) {
    maxMin = 1
  }
  popularFiles = popularFiles.map(function (f) {
    f.score = Math.round(4 * (f.count - min) / maxMin + 1)
    return f
  })

  return popularFiles
}

export default function reducer (state = initialState, action) {
  const handler = handlers[action.type]
  return handler ? handler(state, action) : state
}

const handlers = {
  'CONTENT_FETCH_SUCCEEDED': (state, action) => {
    const { content, contentPath } = action
    const [files, topLevelFiles] = postProcessContent(content, contentPath, state)
    return { ...state, content: files, topLevelFiles, contentPath, loading: false }
  },

  'CONTENT_FETCH_FAILED': (state, action) => {
    return { ...state, error: action.message, loading: false }
  },

  'CONFIG_FETCH_SUCCEEDED': (state, action) => {
    return { ...state, config: action.config, needsConfig: false }
  },

  'CONFIG_FETCH_FAILED': (state, action) => {
    return { ...state, error: action.message }
  },

  'SET_CONFIG_PATH': (state, action) => {
    return { ...state, configPath: action.payload.configPath }
  },

  'LOADING_START': (state, action) => {
    return { ...state, loading: true }
  },

  'STATS_FETCH_SUCCEEDED': (state, action) => {
    const {stats} = action
    const popularFiles = postProcessStats(stats)
    return { ...state, popularFiles }
  },

  'STATS_FETCH_FAILED': (state, action) => {
    console.warn('Failed to fetch stats')
    return { ...state }
  },

  'MESSAGES_FETCH_START': (state, action) => {
    return { ...state, error: action.message, loadingMessages: true }
  },

  'MESSAGES_FETCH_SUCCEEDED': (state, action) => {
    const { messages } = action
    const mention = action.checkMentions ? (state.mention ? true : messages.reduce((mentioned, message) => {
      if (!mentioned) {
        if (message.body.indexOf(`@${state.nick}`) !== -1) {
          return true
        }
        return false
      }
      return true
    }, false)) : false
    return {
      ...state,
      chatOffline: false,
      maxMessageId: messages.length > 0 ? messages.reduce((max, message) =>
        message.id > max ? message.id : max, 0) : state.maxMessageId,
      messages: Object.assign({}, state.messages, messages.reduce((map, message) => {
        map[message.id] = message
        return map
      }, {})),
      mention,
      loadingMessages: false,
      newMessages: !mention && state.maxMessageId !== undefined && (state.newMessages || (messages && messages.length > 0))
    }
  },

  'MESSAGES_FETCH_FAILED': (state, action) => {
    return { ...state, chatOffline: true, loadingMessages: false }
  },

  'MESSAGE_SEND_SUCCEEDED': (state, action) => {
    return {
      ...state,
      sentMessages: [
        ...state.sentMessages,
        action.messageId
      ]
    }
  },

  'MESSAGE_SEND_FAILED': (state, action) => {
    return { ...state, error: action.message }
  },

  'FETCH_NICK_SUCCEEDED': (state, action) => {
    return { ...state, nick: action.nick }
  },

  'SAVE_NICK_SUCCEEDED': (state, action) => {
    return { ...state, nick: action.nick }
  },

  'FETCH_TEXT_DIRECTION_SUCCEEDED': (state, action) => {
    return { ...state, textDirection: action.textDirection }
  },

  'SAVE_TEXT_DIRECTION_SUCCEEDED': (state, action) => {
    return { ...state, textDirection: action.textDirection }
  },

  'TOGGLE_CHAT_PANEL': (state, action) => {
    return { ...state, chatPanelShowing: action.showing }
  },

  'CLEAR_MESSAGE_NOTIFICATIONS': (state, action) => {
    return { ...state, mention: false, newMessages: false }
  },

  'GET_PROPERTY_START': (state, action) => {
    return { ...state, adminLoadError: null }
  },

  'GET_PROPERTY_FAILED': (state, action) => {
    return { ...state, adminLoadError: action.message}
  },

  'GET_PROPERTY_SUCCEEDED': (state, action) => {
    const {name, value} = action
    return { ...state, [`prop_${name.replace('-', '_')}`]: name === 'ui-config' ? JSON.parse(value) : value}
  },

  'SET_PROPERTY_START': (state, action) => {
    return { ...state, propertyUpdating: true, adminError: null, propertyTimeoutWait: false }
  },

  'SET_PROPERTY_FAILED': (state, action) => {
    return { ...state, adminError: action.message, propertyUpdating: false }
  },

  'SET_PROPERTY_TIMEOUT_WAIT': (state, action) => {
    return { ...state, propertyTimeoutWait: true }
  },

  'SET_PROPERTY_TIMEOUT_EXCEEDED': (state, action) => {
    return { ...state, propertyUpdating: false, adminError: action.message }
  },

  'SET_PROPERTY_SUCCEEDED': (state, action) => {
    const {name, value} = action
    const nameSafe = name.replace('-', '_')
    const passwordUpdated = nameSafe === 'password'
    return { ...state,
      [`prop_${nameSafe}`]: !passwordUpdated ? value : null,
      latestPropUpdate: nameSafe,
      propertyUpdating: false,
      passwordUpdated
    }
  },

  'TRIGGER_EVENT_START': (state, action) => {
    return { ...state, propertyUpdating: true, adminError: null }
  },

  'TRIGGER_EVENT_FAILED': (state, action) => {
    return { ...state, adminError: action.message, propertyUpdating: false}
  },

  'TRIGGER_EVENT_SUCCEEDED': (state, action) => {
    const {name, event} = action
    return { ...state, [`evt_${name.replace('-', '_')}`]: event, propertyUpdating: false}
  },

  'CLEAR_PASSWORD_UPDATED': (state, action) => {
    return { ...state, passwordUpdated: false, authorization: null }
  },

  'AUTHENTICATE_START': (state, action) => {
    return { ...state, authorization: '' }
  },

  'AUTHENTICATE_SUCCEEDED': (state, action) => {
    const { authorization, version } = action
    localStorage.setItem('admin-authorization', authorization)
    return { ...state, authorization, version }
  },

  'AUTHENTICATE_FAILED': (state, action) => {
    const { version } = action
    localStorage.setItem('admin-authorization', null)
    return { ...state, authorization: null, version }
  }
}
