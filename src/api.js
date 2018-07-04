import axios from 'axios'

export function postMessage (params = {}) {
  const {message} = params
  return post(`/chat/messages`, message)
}

export function getMessages (params = {}) {
  const {max_id = null} = params
  if (max_id) {
    return get(`/chat/messages?max_id=${max_id}`)
  } else {
    return get(`/chat/messages`)
  }
}

export function getDefaultTextDirection () {
  return get('/chat/messages/textDirection')
}

export function getContent (params = {}) {
  const {contentPath} = params
  return get(`/content/${contentPath}/`)
}

export function getConfig (params = {}) {
  const {configPath} = params
  return get(configPath)
}

export function getStats (params = {}) {
  const {statsPath} = params
  return get(statsPath, {})
}

export function getProperty (params = {}) {
  const {authorization, propertyName} = params
  return get(`api/${propertyName}`, authorization)
}

export function setProperty (params = {}) {
  const {authorization, propertyName, propertyValue, wrap, timeout} = params
  return put(`api/${propertyName}`, wrap ? {value: propertyValue} : propertyValue, authorization, timeout)
}

export function triggerEvent (params = {}) {
  const {authorization, propertyName, eventType} = params
  return post(`api/${propertyName}`, {value: eventType}, authorization)
}

function get (url, authorization, defaultValue, timeout) {
  let config = {}
  if (timeout) {
    config.timeout = timeout
  }
  if (authorization) {
    config.headers = {
      Authorization: authorization
    }
  }
  return axios.get(url, config).then(resp => resp).catch(e => {
    if (defaultValue) {
      return defaultValue
    }
    throw e
  })
}

function post (url, body, authorization, timeout) {
  let config = {}
  if (timeout) {
    config.timeout = timeout
  }
  if (authorization) {
    config.headers = {
      Authorization: authorization
    }
  }
  return axios.post(url, body, config).then(resp => resp.data).catch(e => {
    if (e.message.startsWith('timeout of')) {
      e.errorType = 'TIMEOUT'
    } else if (e.message === 'Network Error') {
      e.errorType = 'NETWORK_ERROR'
    }
    throw e
  })
}

async function put (url, body, authorization, timeout) {
  let config = {}
  if (timeout) {
    config.timeout = timeout
  }
  if (authorization) {
    config.headers = {
      Authorization: authorization
    }
  }
  try {
    return await axios.put(url, body, config)
  } catch (e) {
    if (e.message.startsWith('timeout of')) {
      e.errorType = 'TIMEOUT'
    } else if (e.message === 'Network Error') {
      e.errorType = 'NETWORK_ERROR'
    }
    throw e
  }
}
