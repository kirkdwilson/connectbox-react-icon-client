import './FolderList.css'
import './RootFolderList.css'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import RootFolderListEntry from './RootFolderListEntry'

class RootFolderList extends Component {
    static propTypes = {
        content: PropTypes.array.isRequired,
        contentRoot: PropTypes.string.isRequired,
        displayFolderName: PropTypes.bool.isRequired,
        iconMetadata: PropTypes.object.isRequired
    }

  render () {
    const { content, contentRoot, displayFolderName, iconMetadata } = this.props
    let menuItems = []
    for (let i = 0; i < content.length; i++) {
      menuItems.push(
        <RootFolderListEntry
            contentRoot={contentRoot}
            key={`root${i}`}
            file={content[i]}
            displayFolderName={displayFolderName}
            iconMetadata={iconMetadata}
        />)
    }

    return (
      <div className="table-responsive">
          <table className="table collapsed">
              <tbody>
                  {menuItems}
              </tbody>
          </table>
      </div>
    )
  }
}

export default RootFolderList
