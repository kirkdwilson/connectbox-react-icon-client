import { call, put, takeLatest, select } from 'redux-saga/effects'
import {getContent, getConfig, getStats} from './api'

const checkNeedsConfig = (state) => state.needsConfig
const getConfigPath = (state) => state.configPath
const getConfigFromStore = (state) => state.config
const getPopularFiles = (state) => state.popularFiles

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
