import axios from 'axios'

export function postMessage (message) {
  return post(`/chat/messages`, message)
}

export function getMessages (max_id = null) {
  if (max_id) {
    return get(`/chat/messages?max_id=${max_id}`)
  } else {
    return get(`/chat/messages`)
  }
}

export function getDefaultTextDirection () {
  return get('/chat/messages/textDirection')
}

export function getContent (contentPath) {
  return get(`/content/${contentPath}/`)
}

export function getConfig (configPath) {
  return get(configPath)
}

export function getStats (statsPath) {
  return get(statsPath, {})
}

function get (url, defaultValue) {
  return axios.get(url).then(resp => resp.data).catch(e => {
    if (defaultValue) {
      return defaultValue
    }
    throw e
  })
}

function post (url, body) {
  return axios.post(url, body).then(resp => resp.data).catch(e => {
    throw e
  })
}
