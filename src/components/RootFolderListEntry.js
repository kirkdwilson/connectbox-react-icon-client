import './RootFolderListEntry.css'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {  topLevelCategory } from '../utils'
import { Link } from 'react-router-dom'

class RootFolderListEntry extends Component {
    static propTypes = {
        file: PropTypes.object.isRequired,
        contentRoot: PropTypes.string.isRequired,
        displayFolderName: PropTypes.bool.isRequired,
        iconMetadata: PropTypes.object.isRequired
    }

  render () {
    const { file, contentRoot, displayFolderName, iconMetadata } = this.props
    const { icon_file, name } = file
    const fileLink = `#/${name}`

    let spanClass = 'directory'
    if (!displayFolderName) {
      spanClass = spanClass + ' row_name'
    }

    let folderNameSpan = undefined
    if (icon_file) {
      if (displayFolderName) {
        folderNameSpan = (
          <span>{name}</span>
        )
      }

      return (
        <tr>
          <td className="centered">
            <Link to={fileLink}>
              <div className="home-icon-container">
                  <img alt="" src={`${contentRoot}/${icon_file}`} />
              </div>
              {folderNameSpan}
              <span className={spanClass}></span>
            </Link>
          </td>
        </tr>
      )
    }

    if (displayFolderName) {
      folderNameSpan = (
        <span><br />{name}</span>
      )
    }

    return (
      <tr>
        <td className="centered">
          <Link to={fileLink}>
            <i className={ `fa ${topLevelCategory(file, iconMetadata)}` }></i>
            {folderNameSpan}
            <span className={spanClass}></span>
          </Link>
        </td>
      </tr>
    )
  }
}

export default RootFolderListEntry
