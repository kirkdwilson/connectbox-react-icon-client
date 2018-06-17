import './Footer.css'

import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class Footer extends Component {
  onSettingsClick = (evt) => {
    window.location.href = '/admin/'
  }

  render () {
    return (
      <div
        className='footer breadcrumb'>
        <div className='spacer' />
        <Link className='settings-button' to='/admin/'>
          <i className={`fa fa-cog fa-lg`} aria-hidden='true'></i>
        </Link>
      </div>
    )
  }
}

export default Footer
