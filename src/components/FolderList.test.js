import React from 'react'
import FolderList from './FolderList'
import renderer from 'react-test-renderer'

test('Render FolderList', () => {
  const iconMetadata = { ids: [], names: {}}
  const content = [{type: 'file', ext: 'doc', name: 'Test File'}]
  const component = renderer.create(
    <FolderList
      contentRoot='/content'
      content={content}
      folderPath='foo'
      iconMetadata={iconMetadata} />
  )
  let tree = component.toJSON()
  expect(tree).toMatchSnapshot()
})
