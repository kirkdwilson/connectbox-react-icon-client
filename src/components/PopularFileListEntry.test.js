import React from 'react'
import PopularFileListEntry from './PopularFileListEntry'
import renderer from 'react-test-renderer'

test('Render PopularFileListEntry with hidden top border', () => {
  const iconMetadata = { ids: [], names: {}}
  const file = {type: 'file', ext: 'doc', name: 'Test File'}
  const component = renderer.create(
    <PopularFileListEntry
      contentRoot='/content'
      key='fooEntry0'
      file={file}
      hideTopBorder
      folderPath='foo'
      iconMetadata={iconMetadata} />
  )
  let tree = component.toJSON()
  expect(tree).toMatchSnapshot()
})

test('Render PopularFileListEntry without hidden top border', () => {
  const iconMetadata = { ids: [], names: {}}
  const file = {type: 'file', ext: 'doc', name: 'Test File'}
  const component = renderer.create(
    <PopularFileListEntry
      contentRoot='/content'
      key='fooEntry0'
      file={file}
      hideTopBorder={false}
      folderPath='foo'
      iconMetadata={iconMetadata} />
  )
  let tree = component.toJSON()
  expect(tree).toMatchSnapshot()
})
