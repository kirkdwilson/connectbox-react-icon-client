/* global it, expect, */
import React from 'react'
import RootFolderList from './RootFolderList'
import renderer from 'react-test-renderer'

import { MemoryRouter as Router } from 'react-router-dom'

it('Render RootFolderList with folder name', () => {
  const iconMetadata = {ids: [], names: {}}
  const content = [{type: 'file', ext: 'doc', name: 'Test File'}]
  const component = renderer.create(
    <Router>
      <RootFolderList
        contentRoot='/content'
        content={content}
        displayFolderName
        folderPath='foo'
        iconMetadata={iconMetadata} />
    </Router>
  )
  let tree = component.toJSON()
  expect(tree).toMatchSnapshot()
})

it('Render RootFolderList without folder name', () => {
  const iconMetadata = {ids: [], names: {}}
  const content = [{type: 'file', ext: 'doc', name: 'Test File'}]
  const component = renderer.create(
    <Router>
      <RootFolderList
        contentRoot='/content'
        content={content}
        displayFolderName={false}
        folderPath='foo'
        iconMetadata={iconMetadata} />
    </Router>
  )
  let tree = component.toJSON()
  expect(tree).toMatchSnapshot()
})
