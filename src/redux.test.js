import { getContent, setConfigPath } from './redux'

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
