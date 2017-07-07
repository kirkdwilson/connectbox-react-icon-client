import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { mediaTypes } from '../utils'

class PopularFileListEntry extends Component {
    static propTypes = {
        file: PropTypes.object.isRequired,
        hideTopBorder: PropTypes.bool.isRequired,
    }

  render () {
    const { hideTopBorder, file } = this.props
    const popIndicatorElements = []
    for (let j = 0; j < file.score; j++) {
        popIndicatorElements.push(<span key={`score${j}`}><i className="fa fa-stop"></i></span>)
    }

    return (
        <tr>
            <td style={hideTopBorder ? {borderTop: 0} : {}}>
                <a style={{display: "inline-block"}} href={file.resource}>
                    <i className={`fa ${mediaTypes(file)}`}></i>
                    <span>&nbsp;{file.name}</span>
                </a>
                <span style={{display: "inline-block"}}>&nbsp;{popIndicatorElements}</span>
            </td>
        </tr>
    )
  }
}

export default PopularFileListEntry