import axios from 'axios'

export function getContent (contentPath) {
  return get(`/content/${contentPath}/`, [])
}

export function getConfig (configPath) {
  return get(configPath, {})
}

export function getStats (statsPath) {
  return get(statsPath, {})
}

function get (url, val) {
  return axios.get(url).then(resp => resp.data).catch((e) => {
    return val
  })
}
