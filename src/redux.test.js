import reducer, { getContent, setConfigPath, initialState } from './redux'

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

// Action creators
describe('action creators', () => {
  it('should create a getContent action', () => {
    const expected = {
      type: 'CONTENT_FETCH_REQUESTED',
      payload: {contentPath: 'foo'}
    }

    expect(getContent(expected.payload.contentPath)).toEqual(expected)
  })

  it('should create a setConfigPath action', () => {
    const expected = {
      type: 'SET_CONFIG_PATH',
      payload: {configPath: '/config/default.json'}
    }
    expect(setConfigPath()).toEqual(expected)

    expected.payload.configPath = '/foo'
    expect(setConfigPath(expected.payload.configPath)).toEqual(expected)
  })
})

// Reducers
describe('reducers', () => {
  it('returns initialState for undefined action', () => {
    expect(reducer(undefined, {})).toEqual(initialState)
  })

  it('sets error message on load failures', () => {
    const error = 'error!'
    let state = reducer(undefined, {type: 'STATS_FETCH_FAILED', message: error})
    expect(state.error).toEqual(error)
    state = reducer(undefined, {type: 'CONFIG_FETCH_FAILED', message: error})
    expect(state.error).toEqual(error)
    state = reducer(undefined, {type: 'CONTENT_FETCH_FAILED', message: error})
    expect(state.error).toEqual(error)
  })

  it('successfully fetches stats', () => {
    const mockStatsResponse = {'hour': [], 'month': [{'resource': '/content/README.txt', 'count': 1}], 'week': [{'resource': '/content/README.txt', 'count': 1}], 'day': [{'resource': '/content/README.txt', 'count': 1}], 'year': [{'resource': '/content/README.txt', 'count': 1}]}
    const expectedPopularFiles = {resource: '/content/README.txt', count: 1, name: 'README.txt', ext: 'txt', score: 1}
    let state = reducer(undefined, {type: 'STATS_FETCH_SUCCEEDED', stats: mockStatsResponse})
    expect(state.popularFiles).toEqual([expectedPopularFiles])
  })

  it('successfully fetches config', () => {
    let state = reducer(undefined, {type: 'CONFIG_FETCH_SUCCEEDED', config})
    expect(state.config).toEqual(config)
  })

  it('successfully fetches content', () => {
    const contentPath = '/'
    const mockDate = 'Thu, 29 Jun 2017 02:23:21 GMT'
    const mockRootResponse = [
        { 'name': 'Help', 'type': 'directory', 'mtime': mockDate },
        { 'name': 'King James Bible.epub', 'type': 'file', 'mtime': 'Thu, 29 Jun 2017 02:23:21 GMT', 'size': 1457717 }
    ]
    const expectedContent = [ { name: 'Help',
      type: 'directory',
      mtime: new Date(mockDate),
      isTopLevel: true } ]
    const expectedTopLevelFiles = [ { name: 'King James Bible.epub',
      type: 'file',
      mtime: new Date(mockDate),
      size: 1457717,
      isTopLevel: false,
      ext: 'epub' } ]
    let state = reducer({config}, {type: 'CONTENT_FETCH_SUCCEEDED', content: mockRootResponse, contentPath})
    expect(state.content).toEqual(expectedContent)
    expect(state.topLevelFiles).toEqual(expectedTopLevelFiles)
    expect(state.contentPath).toEqual(contentPath)
  })
})
