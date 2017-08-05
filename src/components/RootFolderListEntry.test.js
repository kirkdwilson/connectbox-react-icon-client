/* global it, expect, */
import React from 'react'
import RootFolderListEntry from './RootFolderListEntry'
import renderer from 'react-test-renderer'
import { MemoryRouter as Router } from 'react-router-dom'

it('Render RootFolderListEntry', () => {
  const iconMetadata = {ids: [], names: {}}
  const file = {type: 'file', ext: 'doc', name: 'Test File'}
  const component = renderer.create(
    <Router>
      <RootFolderListEntry
        contentRoot='/content'
        key='fooEntry0'
        file={file}
        iconMetadata={iconMetadata}
        displayFolderName />
    </Router>
  )
  let tree = component.toJSON()
  expect(tree).toMatchSnapshot()
})
