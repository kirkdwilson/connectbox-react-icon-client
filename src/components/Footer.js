import './Footer.css'

import React, { Component } from 'react'

class Footer extends Component {
  onSettingsClick = (evt) => {
    window.location.href = '/admin/'
  }

  render () {
    return (
      <div
        className='footer breadcrumb'>
        <div className='settings-button' onClick={this.onSettingsClick}>
          <i className={`fa fa-cog fa-lg`} aria-hidden='true'></i>
        </div>
      </div>
    )
  }
}

export default Footer
