import './FolderListEntry.css'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {  topLevelCategory, mediaTypes } from '../utils'

class FolderListEntry extends Component {
    static propTypes = {
        file: PropTypes.object.isRequired,
        folderPath: PropTypes.string.isRequired,
        contentRoot: PropTypes.string.isRequired,
        iconMetadata: PropTypes.object.isRequired
    }

  render () {
    const { file, contentRoot, folderPath, iconMetadata } = this.props
    const { icon_file, name } = file
    const fileLink = `${file.type === 'directory' ? '#' : contentRoot}${folderPath}/${name}`

    let spanClass = file.type === 'directory' ? 'directory' : ''

    if (icon_file) {
      return (
          <tr>
            <td>
              <a href={fileLink}>
                <div className="subfolder-icon-container">
                    <img alt="" src={`${contentRoot}${folderPath}/${icon_file}`} />
                </div>
                <span className={spanClass}>
                    <span>&nbsp;{name}</span>
                </span>
              </a>
            </td>
          </tr>
      )
    }

    return (
      <tr>
        <td>
          <a href={fileLink}>
            <i className={ `fa ${topLevelCategory(file, iconMetadata)}` }></i>
            <i className={`fa ${mediaTypes(file)}`}></i>
            <span className={spanClass}>
                <span>&nbsp;{name}</span>
            </span>
          </a>
        </td>
      </tr>
    )
  }
}

export default FolderListEntry
