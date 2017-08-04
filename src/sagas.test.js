import axios from 'axios'
import SagaTester from 'redux-saga-tester'
import saga from './sagas'
import MockAdapter from 'axios-mock-adapter'
import reducer from './redux'
const mock = new MockAdapter(axios)

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

describe('Sagas with config already loaded', () => {
  const initialState = {
    content: [],
    error: undefined,
    config,
    configPath: '/config/default.json',
    contentPath,
    iconMetadata,
    needsConfig: false,
    loading: false,
    popularFiles: null
  }
  let sagaTester

  beforeEach(() => {
    sagaTester = new SagaTester({
      initialState,
      reducers: reducer
    })
    sagaTester.start(saga)
  })

  afterEach(() => {
    mock.reset()
  })

  test('Fetches content from root', async () => {
    const mockTS = 'Thu, 29 Jun 2017 02:23:21 GMT'
    const expected = {isTopLevel: true, mtime: new Date(mockTS), name: 'Help', type: 'directory'}
    const mockRootResponse = [{ 'name': 'Help', 'type': 'directory', 'mtime': mockTS }]
    mock.onGet('/content//').reply(200, mockRootResponse)

    const expectedPopularFiles = {resource: '/content/README.txt', count: 1, name: 'README.txt', ext: 'txt', score: 1}
    const mockStatsResponse = {'hour': [], 'month': [{'resource': '/content/README.txt', 'count': 1}], 'week': [{'resource': '/content/README.txt', 'count': 1}], 'day': [{'resource': '/content/README.txt', 'count': 1}], 'year': [{'resource': '/content/README.txt', 'count': 1}]}
    mock.onGet(config.Client.stats_file).reply(200, mockStatsResponse)

    sagaTester.dispatch({ type: 'CONTENT_FETCH_REQUESTED', payload: { contentPath: '' } })
    await sagaTester.waitFor('LOADING_START')
    await sagaTester.waitFor('CONTENT_FETCH_SUCCEEDED')
    await sagaTester.waitFor('STATS_FETCH_SUCCEEDED')

    const state = sagaTester.getState()
    expect(state.content.length).toEqual(1)
    expect(state.content[0]).toEqual(expected)
    expect(state.popularFiles.length).toEqual(1)
    expect(state.popularFiles[0]).toEqual(expectedPopularFiles)
  })

  test('Fetches content from root and stats config fails', async () => {
    const mockTS = 'Thu, 29 Jun 2017 02:23:21 GMT'
    const expected = {isTopLevel: true, mtime: new Date(mockTS), name: 'Help', type: 'directory'}
    const mockRootResponse = [{ 'name': 'Help', 'type': 'directory', 'mtime': mockTS }]
    mock.onGet('/content//').reply(200, mockRootResponse)

    mock.onGet(config.Client.stats_file).reply(404)

    sagaTester.dispatch({ type: 'CONTENT_FETCH_REQUESTED', payload: { contentPath: '' } })
    await sagaTester.waitFor('LOADING_START')
    await sagaTester.waitFor('CONTENT_FETCH_SUCCEEDED')
    await sagaTester.waitFor('STATS_FETCH_SUCCEEDED')

    const state = sagaTester.getState()
    expect(state.content.length).toEqual(1)
    expect(state.content[0]).toEqual(expected)
    expect(state.popularFiles.length).toEqual(0)
  })

  test('Fetches content from a subfolder', async () => {
    const mockTS = 'Thu, 29 Jun 2017 02:23:21 GMT'
    const expected = {isTopLevel: false, mtime: new Date(mockTS), name: 'Help', type: 'directory'}
    const mockResponse = [{ 'name': 'Help', 'type': 'directory', 'mtime': mockTS }]
    mock.onGet('/content/foo/').reply(200, mockResponse)

    sagaTester.dispatch({ type: 'CONTENT_FETCH_REQUESTED', payload: { contentPath: 'foo' } })
    await sagaTester.waitFor('LOADING_START')
    await sagaTester.waitFor('CONTENT_FETCH_SUCCEEDED')

    const state = sagaTester.getState()
    expect(state.content.length).toEqual(1)
    expect(state.content[0]).toEqual(expected)
  })

  test('Fetches content from a subfolder and receives 500', async () => {
    mock.onGet('/content/foo/').reply(500)

    sagaTester.dispatch({ type: 'CONTENT_FETCH_REQUESTED', payload: { contentPath: 'foo' } })
    await sagaTester.waitFor('LOADING_START')
    await sagaTester.waitFor('CONTENT_FETCH_FAILED')

    const state = sagaTester.getState()
    expect(state.content.length).toEqual(0)
    expect(state.error).toEqual('Unable to load content')
  })
})

describe('Sagas with config not loaded', () => {
  const initialState = {
    content: [],
    error: undefined,
    config: {},
    configPath: '/config/default.json',
    contentPath,
    iconMetadata,
    needsConfig: true,
    loading: false,
    popularFiles: null
  }
  let sagaTester

  beforeEach(() => {
    sagaTester = new SagaTester({
      initialState,
      reducers: reducer
    })
    sagaTester.start(saga)
  })

  afterEach(() => {
    mock.reset()
  })

  test('Fetches content from a subfolder', async () => {
    expect(sagaTester.getState().config).toEqual({})
    const mockTS = 'Thu, 29 Jun 2017 02:23:21 GMT'
    const expected = {isTopLevel: false, mtime: new Date(mockTS), name: 'Help', type: 'directory'}
    const mockResponse = [{ 'name': 'Help', 'type': 'directory', 'mtime': mockTS }]
    mock.onGet('/content/foo/').reply(200, mockResponse)
    mock.onGet(initialState.configPath).reply(200, config)

    sagaTester.dispatch({ type: 'CONTENT_FETCH_REQUESTED', payload: { contentPath: 'foo' } })
    await sagaTester.waitFor('LOADING_START')
    await sagaTester.waitFor('CONFIG_FETCH_SUCCEEDED')
    await sagaTester.waitFor('CONTENT_FETCH_SUCCEEDED')

    const state = sagaTester.getState()
    expect(state.content.length).toEqual(1)
    expect(state.content[0]).toEqual(expected)
    expect(state.config).toEqual(config)
  })

  test('Fetches content from a subfolder with a config fail', async () => {
    expect(sagaTester.getState().config).toEqual({})
    const mockTS = 'Thu, 29 Jun 2017 02:23:21 GMT'
    const mockResponse = [{ 'name': 'Help', 'type': 'directory', 'mtime': mockTS }]
    mock.onGet('/content/foo/').reply(200, mockResponse)
    mock.onGet(initialState.configPath).reply(500)

    sagaTester.dispatch({ type: 'CONTENT_FETCH_REQUESTED', payload: { contentPath: 'foo' } })
    await sagaTester.waitFor('LOADING_START')
    await sagaTester.waitFor('CONFIG_FETCH_FAILED')

    const state = sagaTester.getState()
    expect(state.content.length).toEqual(0)
    expect(state.error).toEqual('Unable to load configuration')
  })
})
