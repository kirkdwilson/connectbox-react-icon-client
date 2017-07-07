import './FolderList.css'
import './PopularFileList.css'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PopularFileListEntry from './PopularFileListEntry'

class PopularFileList extends Component {
    static propTypes = {
      popularFiles: PropTypes.array.isRequired
    }

  render () {
    const { popularFiles } = this.props
    const popularFileElements = []
    for (let i = 0; popularFiles && i < popularFiles.length; i++) {
      const file = popularFiles[i]
      
      popularFileElements.push(
        <PopularFileListEntry
          key={`pop${i}`}
          file={file}
          hideTopBorder={i === 0}
        />
      )
    }

    return (
      <div className="table-responsive">
        <table className="table">
            <tbody>
                <tr><td className="popular-content-header"><i className="fa fa-line-chart"></i></td></tr>
                {popularFileElements}
            </tbody>
        </table>
      </div>
    )
  }
}

export default PopularFileList
