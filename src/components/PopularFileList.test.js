/* global it, expect, */
import React from 'react'
import PopularFileList from './PopularFileList'
import renderer from 'react-test-renderer'

it('Render PopularFileList', () => {
  const iconMetadata = {ids: [], names: {}}
  const content = [{type: 'file', ext: 'doc', name: 'Test File'}]
  const component = renderer.create(
    <PopularFileList
      contentRoot='/content'
      content={content}
      folderPath='foo'
      iconMetadata={iconMetadata}
      popularFiles={content} />
  )
  let tree = component.toJSON()
  expect(tree).toMatchSnapshot()
})
