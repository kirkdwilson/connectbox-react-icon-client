/* global describe, it, expect, jest */
import React from 'react'
import ReactDOM from 'react-dom'
import App, {ConnectBoxApp} from './ConnectBoxApp'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { MemoryRouter as Router } from 'react-router-dom'
import createSagaMiddleware from 'redux-saga'
import reducer from './redux'
import { createStore, applyMiddleware, compose } from 'redux'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'

const config = {
  Content: {
    contentRoute: '/content'
  },
  Client: {
    tail_slash: true,
    display_root_folder_names: true,
    icon_prefix: '_icon_',
    stats_file: 'stats.top10.json'
  }
}
const iconMetadata = {ids: [], names: {}}
const contentPath = ''
const sagaMiddleware = createSagaMiddleware()

describe('ConnectBoxApp tests', () => {
  it('renders without crashing', () => {
    const makeMockStore = configureMockStore([sagaMiddleware])

    const mockStore = makeMockStore({
      content: [],
      error: undefined,
      config,
      configPath: '/config/default.json',
      contentPath,
      iconMetadata,
      needsConfig: false,
      loading: false,
      popularFiles: null
    }, reducer)

    const div = document.createElement('div')
    ReactDOM.render(<Provider store={mockStore}><Router><App /></Router></Provider>, div)
  })

  it('shallow render succeeds', () => {
    shallow(
      <ConnectBoxApp
        contentPath='/'
        config={config}
        content={[]}
        getContent={jest.fn()}
        setConfigPath={jest.fn()}
        history={{}}
        iconMetadata={{}}
        loading={false}
        location={{}} />)
  })

  it('renders content fully', () => {
    const mockDate = new Date('Thu, 29 Jun 2017 02:23:21 GMT')
    const prepopulatedState = { content:
    [ { name: 'Help',
      type: 'directory',
      mtime: mockDate,
      isTopLevel: true,
      icon_file: '_icon_Help.png' },
    { name: 'Music',
      type: 'directory',
      mtime: mockDate,
      isTopLevel: true },
    { name: 'Videos',
      type: 'directory',
      mtime: mockDate,
      isTopLevel: true,
      icon_class: 'fa-video-camera' },
    { name: 'standard-folder',
      type: 'directory',
      mtime: mockDate,
      isTopLevel: true },
    { name: 'throughput-test',
      type: 'directory',
      mtime: mockDate,
      isTopLevel: true },
    { name: 'written',
      type: 'directory',
      mtime: mockDate,
      isTopLevel: true,
      icon_class: 'fa-book' } ],
      error: undefined,
      config:
      { Content: { contentRoute: '/content' },
        Client:
        { tail_slash: true,
          display_root_folder_names: true,
          icon_prefix: '_icon_',
          stats_file: 'stats.top10.json' } },
      configPath: '/config/default.json',
      contentPath: '',
      iconMetadata: { ids: [], names: {} },
      needsConfig: false,
      loading: false,
      popularFiles:
      [ { resource: '/content/Music/Vivaldi%20-%20Spring%20from%20Four%20Seasons.mp3',
        count: 2,
        name: 'Vivaldi - Spring from Four Seasons.mp3',
        ext: 'mp3',
        score: 5 },
      { resource: '/content/README.txt',
        count: 1,
        name: 'README.txt',
        ext: 'txt',
        score: 1 },
      { resource: '/content/throughput-test/10MB.bin',
        count: 1,
        name: '10MB.bin',
        ext: 'bin',
        score: 1 } ],
      topLevelFiles:
      [ { name: 'King James Bible.epub',
        type: 'file',
        mtime: mockDate,
        size: 1457717,
        isTopLevel: false,
        ext: 'epub' },
      { name: 'README.txt',
        type: 'file',
        mtime: mockDate,
        size: 2886,
        isTopLevel: false,
        ext: 'txt' } ] }

    const prepopulatedStore = createStore(reducer, prepopulatedState, compose(applyMiddleware(sagaMiddleware)))
    const component = renderer.create(<Provider store={prepopulatedStore}><Router><App /></Router></Provider>)
    expect(component.toJSON()).toMatchSnapshot()
  })
})
