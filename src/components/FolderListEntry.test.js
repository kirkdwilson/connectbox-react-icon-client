/* global it, expect, */
import React from 'react'
import FolderListEntry from './FolderListEntry'
import renderer from 'react-test-renderer'

it('Render FolderListEntry', () => {
  const iconMetadata = {ids: [], names: {}}
  const file = {type: 'file', ext: 'doc', name: 'Test File'}
  const component = renderer.create(
    <FolderListEntry
      contentRoot='/content'
      key='fooEntry0'
      file={file}
      folderPath='foo'
      iconMetadata={iconMetadata} />
  )
  let tree = component.toJSON()
  expect(tree).toMatchSnapshot()
})
