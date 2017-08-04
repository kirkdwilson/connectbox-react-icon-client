import React from 'react'
import NavigationBar from './NavigationBar'
import renderer from 'react-test-renderer'
import { MemoryRouter as Router } from 'react-router-dom'

test('Render NavigationBar Root', () => {
  const component = renderer.create(
    <Router>
      <NavigationBar
        contentPath='/content'
        reload={() => {}}
        loading={false} />
    </Router>
  )
  let tree = component.toJSON()
  expect(tree).toMatchSnapshot()
})

test('Render NavigationBar Subfolder', () => {
  const component = renderer.create(
    <Router>
      <NavigationBar
        contentPath='/content/foo/bar'
        reload={() => {}}
        loading={false} />
    </Router>
  )
  let tree = component.toJSON()
  expect(tree).toMatchSnapshot()
})

test('Render NavigationBar Root - Loading', () => {
  const component = renderer.create(
    <Router>
      <NavigationBar
        contentPath='/content'
        reload={() => {}}
        loading />
    </Router>
  )
  let tree = component.toJSON()
  expect(tree).toMatchSnapshot()
})
