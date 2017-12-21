// import './index.css'

import React from 'react'
import ReactDOM from 'react-dom'
import ConnectBoxApp from './ConnectBoxApp'
import registerServiceWorker from './registerServiceWorker'
import { Provider } from 'react-redux'

import { createStore, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'

import reducer from './redux'
import mySaga from './sagas'
import { BrowserRouter } from 'react-router-dom'

const devTools =
  (typeof window === 'object' && window.devToolsExtension) ||
  (() => noop => noop)

const sagaMiddleware = createSagaMiddleware()

let initialState = {
  chatPanelShowing: false,
  // DEFAULT CONFIG
  config: {
    'Content': {
      'contentRoute': '/content'
    },
    'Client': {
      'banner': false,
      'tail_slash': true,
      'display_root_folder_names': true,
      'icon_prefix': '_icon_',
      'stats_file': 'stats.top10.json'
    }
  },
  content: [],
  // DEFAULT CONFIG PATH
  configPath: '/config/default.json',
  contentPath: '',
  error: undefined,
  iconMetadata: window.iconMetadata,
  mention: false,
  messages: {},
  needsConfig: true,
  newMessages: false,
  nick: null,
  loading: false,
  popularFiles: null,
  sentMessages: [],
  textDirection: 'ltr'
}
let store = createStore(reducer, initialState, compose(applyMiddleware(sagaMiddleware), devTools()))

sagaMiddleware.run(mySaga)

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <ConnectBoxApp />
    </BrowserRouter>
  </Provider>
    , document.getElementById('root'))
registerServiceWorker()
