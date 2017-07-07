import './NavigationBar.css'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

class NavigationBar extends Component {
    static propTypes = {
        contentPath: PropTypes.string.isRequired,
        loading: PropTypes.bool.isRequired,
        reload: PropTypes.func.isRequired
    }

    constructor (props) {
        super(props)

        this.pathParts = this.pathParts.bind(this)
    }

    pathParts () {
      const { contentPath } = this.props
      let parts = (contentPath === '/' ? '': contentPath).split('/')
      let up = ''
      for (var i = 0, l = parts.length; i < l; i++) {
        const path = up + parts[i]
        up = path + '/'
        parts[i] = { path: path, name: parts[i] || '<root>' }
      }
      return parts
    }

  render () {
    let pathElements = []
    const pathParts = this.pathParts()
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i]
      pathElements.push(
        <li key={`crumb${i}`}>
          {part.name === '<root>' && 
          <span>
           <Link to=''><i className="fa fa-home fa-lg"></i></Link>
          </span>}

          {i === pathParts.length - 1 && part.name !== '<root>' &&
          <span>{part.name}</span>}

          {i < pathParts.length - 1 && part.name !== '<root>' &&
          <Link to={`/#${part.path}`}>{part.name}</Link>}
        </li>
      )
    }

    return (
      <ol className='breadcrumb' style={{left: '20px', right: '20px', position: 'fixed', zIndex: 1000}}>
        <li>
          <a role='button' onClick={this.props.reload} title='Reload'>
            <i className={`fa fa-refresh${this.props.loading ? ' loader' : ''}`} />
          </a>
        </li>
        {pathElements}
      </ol>
    )
  }
}

export default NavigationBar
