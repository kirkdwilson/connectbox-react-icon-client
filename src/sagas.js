import { generateNick } from './utils'
import {
  call,
  put,
  takeLatest,
  select } from 'redux-saga/effects'
import {
  getContent,
  getConfig,
  getMessages,
  getStats,
  getDefaultTextDirection,
  postMessage } from './api'

const checkNeedsConfig = (state) => state.needsConfig
const getConfigPath = (state) => state.configPath
const getConfigFromStore = (state) => state.config
const getPopularFiles = (state) => state.popularFiles
const getMaxMessageId = (state) => state.maxMessageId

function * fetchNick (action) {
  let nick = localStorage.getItem('cb-chat-nick')
  if (!nick || nick === 'undefined') {
    nick = generateNick()
    localStorage.setItem('cb-chat-nick', nick)
  }

  yield put({
    type: 'FETCH_NICK_SUCCEEDED',
    nick
  })
}

function * saveNick (action) {
  localStorage.setItem('cb-chat-nick', action.nick)
  yield put({
    type: 'SAVE_NICK_SUCCEEDED',
    nick: action.nick
  })
}

function * fetchTextDirection (action) {
  let textDirection = localStorage.getItem('cb-chat-text-direction')
  if (!textDirection || textDirection === 'undefined') {
    const res = yield call(getDefaultTextDirection)
    textDirection = res.result
    localStorage.setItem('cb-chat-text-direction', textDirection)
  }

  yield put({
    type: 'FETCH_TEXT_DIRECTION_SUCCEEDED',
    textDirection
  })
}

function * saveTextDirection (action) {
  localStorage.setItem('cb-chat-text-direction', action.textDirection)
  yield put({
    type: 'SAVE_TEXT_DIRECTION_SUCCEEDED',
    textDirection: action.textDirection
  })
}

function * sendMessage (action) {
  const { message } = action

  try {
    const res = yield call(postMessage, message)

    if (res.result && res.result.id) {
      yield put({
        type: 'MESSAGE_SEND_SUCCEEDED',
        messageId: res.result.id
      })
      yield put({
        type: 'NEW_MESSAGES_FETCH_REQUESTED'
      })
    } else {
      yield put({
        type: 'MESSAGE_SEND_FAILED',
        message
      })
    }
  } catch (e) {
    console.error(e)
    yield put({type: 'MESSAGE_SEND_FAILED', message})
  }
}

function * fetchNewMessages (action) {
  try {
    yield put({type: 'MESSAGES_FETCH_START'})
    const maxMessageId = yield select(getMaxMessageId)
    const res = yield call(getMessages, maxMessageId)
    yield put({
      type: 'MESSAGES_FETCH_SUCCEEDED',
      messages: res ? res.result : [],
      checkMentions: true
    })
  } catch (e) {
    console.error(e)
    yield put({type: 'MESSAGES_FETCH_FAILED', message: 'Failed to load messages'})
  }
}

function * fetchMessages (action) {
  try {
    yield put({type: 'MESSAGES_FETCH_START'})
    const res = yield call(getMessages)
    yield put({
      type: 'MESSAGES_FETCH_SUCCEEDED',
      messages: res.result
    })
  } catch (e) {
    console.error(e)
    yield put({type: 'MESSAGES_FETCH_FAILED', message: 'Failed to load messages'})
  }
}

// worker Saga: will be fired on USER_FETCH_REQUESTED actions
function * fetchContent (action) {
  try {
    yield put({type: 'LOADING_START'})
    const needsConfig = yield select(checkNeedsConfig)

    if (needsConfig) {
      try {
        const configPath = yield select(getConfigPath)
        const config = yield call(getConfig, configPath)

        yield put({
          type: 'CONFIG_FETCH_SUCCEEDED',
          config: config
        })
      } catch (e) {
        console.error(e.message)
        yield put({type: 'CONFIG_FETCH_FAILED', message: 'Unable to load configuration'})
        return
      }
    }
    const {contentPath} = action.payload
    const content = yield call(getContent, contentPath)
    yield put({
      type: 'CONTENT_FETCH_SUCCEEDED',
      content: content,
      contentPath: contentPath
    })

    const popularFiles = yield select(getPopularFiles)
    if (popularFiles === null && (contentPath === '' || contentPath === '/')) {
      const config = yield select(getConfigFromStore)
      try {
        const stats = yield call(getStats, config.Client.stats_file)
        yield put({
          type: 'STATS_FETCH_SUCCEEDED',
          stats: stats
        })
      } catch (e) {
        console.error(e.message)
        yield put({type: 'STATS_FETCH_FAILED', message: 'Unable to load popular files'})
      }
    }
  } catch (e) {
    console.error(e.message)
    yield put({type: 'CONTENT_FETCH_FAILED', message: 'Unable to load content'})
  }
}

/*
  Starts fetchUser on each dispatched `USER_FETCH_REQUESTED` action.
  Allows concurrent fetches of user.
*/
function * mySaga () {
  yield takeLatest('CONTENT_FETCH_REQUESTED', fetchContent)
  yield takeLatest('MESSAGES_FETCH_REQUESTED', fetchMessages)
  yield takeLatest('NEW_MESSAGES_FETCH_REQUESTED', fetchNewMessages)
  yield takeLatest('MESSAGE_SEND_REQUESTED', sendMessage)
  yield takeLatest('FETCH_NICK_REQUESTED', fetchNick)
  yield takeLatest('SAVE_NICK_REQUESTED', saveNick)
  yield takeLatest('FETCH_TEXT_DIRECTION_REQUESTED', fetchTextDirection)
  yield takeLatest('SAVE_TEXT_DIRECTION_REQUESTED', saveTextDirection)
}

/*
  Alternatively you may use takeLatest.

  Does not allow concurrent fetches of user. If "USER_FETCH_REQUESTED" gets
  dispatched while a fetch is already pending, that pending fetch is cancelled
  and only the latest one will be run.
*/
// function* mySaga() {
//   yield takeLatest("USER_FETCH_REQUESTED", fetchUser);
// }

export default mySaga
