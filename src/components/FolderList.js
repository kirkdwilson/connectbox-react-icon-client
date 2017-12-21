import './FolderList.css'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FolderListEntry from './FolderListEntry'

class FolderList extends Component {
    static propTypes = {
        content: PropTypes.array.isRequired,
        contentRoot: PropTypes.string.isRequired,
        folderPath: PropTypes.string.isRequired,
        iconMetadata: PropTypes.object.isRequired
    }
  //handles case 2 & 4 for top level and sub folder lists
  render () {
    const { content, contentRoot, folderPath, iconMetadata } = this.props

    return (
      <div className="table-responsive">
          <table className="table">
              <tbody>
                  {content.map((entry, i) =>
                    <FolderListEntry
                      contentRoot={contentRoot}
                      key={`folderEntry${i}`}
                      file={entry}
                      folderPath={folderPath}
                      iconMetadata={iconMetadata}
                  />)}
              </tbody>
          </table>
      </div>
    )
  }
}

export default FolderList
