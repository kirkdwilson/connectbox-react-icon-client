import './admin-component.css'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Banner from './banner'
import Channel from './channel'
import Hostname from './hostname'
import Password from './password'
import Reports from './reports'
import Ssid from './ssid'
import StaticSite from './static-site'
import Login from './login'
import System from './system'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import WaitPanel from './wait-panel'
import WpaPassphrase from './wpa-passphrase'

import {
  checkAuthenticated
} from '../../redux'

// TODO
//  - This will need to fire off a redux event with the password info
//  - can have a separate property on the dashboard that actually displays the update message
//  - SSID needs a wait for update where it polls the value until it gets updated
//  - router - for dashboard so url updates when you click around
//  - Footer is in the incorrect place - not at the bottom
//  - How are we handling errors? I think redux is setting a message but not displaying it
//  - Not clear if there is a better way to deal with the relative asset loading thing
//  - Don't fetch stats.top10.json in admin mode?
//  - add reports - make sure and use PUBLIC_URL

//  - On Reports, consider changing select control to a list of linked options
//  - Reports screen doesn't handle small vertical screen size

const adminRoot = '/admin/'

function mapStateToProps (state) {
  const { authorization, propertyUpdating, version } = state
  return { authorization, propertyUpdating, version }
}

const mapDispatchToProps = {
  checkAuthenticated
}

class AdminPanel extends Component {
  componentWillMount () {
    this.props.checkAuthenticated()
  }

  render () {
    const { authorization, propertyUpdating, version } = this.props

    const { location } = this.props
    const { pathname } = location
    const selected = !authorization ? 'home' : (
      pathname === adminRoot ? 'home' : pathname.substring(adminRoot.length))

    const reportOptions = {
      reports: 1,
      reportsTop10: 1,
      reportsAll: 1
    }

    const configOptions = {
      configuration: 1,
      wap: 1,
      userinterface: 1,
      password: 1,
      system: 1,
      'wap-ssid': 1,
      'wap-channel': 1,
      webserver: 1,
      'webserver-staticsite': 1,
      'webserver-hostname': 1
    }

    const configSelected = configOptions[selected] === 1
    const reportsSelected = reportOptions[selected] === 1

    return (
      <div className={`dashboard ${propertyUpdating ? 'updating' : ''}`}>
        <WaitPanel />
        <div className='dashboardHeader'>
          <span className='headerText headerTitle'>ConnectBox</span>
          {authorization && <span className={`headerText ${selected === 'home' ? 'selected' : ''}`}><Link to='.'>Home</Link></span>}
          {authorization && <span className={`headerText ${selected === 'about' ? 'selected' : ''}`}><Link to='about'>About</Link></span>}
          {authorization && <span className={`headerText ${reportsSelected ? 'selected' : ''}`}><Link to='reports'>Reports</Link></span>}
          {authorization && <span className={`headerText ${configSelected ? 'selected' : ''}`}><Link to='configuration'>Configuration</Link></span>}
          <div className='spacer' />
          <Link className='exit-button' to='/'>
            <i className={`fa fa-times fa-lg`} aria-hidden='true' />
          </Link>
        </div>
        <div className='dashboardBody'>
          {selected === 'home' &&
            (<div>
              <div className='page-header'><h1>ConnectBox Admin Dashboard</h1></div>
              <p className='lead'>Configure this ConnectBox. Default password: ('connectbox')</p>
            </div>
            )
          }
          {!authorization &&
            <Login />
          }
          {authorization && selected === 'about' &&
            (<div>
              <div className='page-header'><h1>About the ConnectBox</h1></div>
              <p className='lead'>ConnectBox Product Information: <a href='https://www.connectbox.technology'>https://www.connectbox.technology</a></p>
              <p className='lead'>ConnectBox Development Information: <a href='https://github.com/ConnectBox/connectbox-pi'>https://github.com/ConnectBox/connectbox-pi</a></p>
            </div>
            )
          }
          {authorization && selected === 'reports' &&
            (<div>
              <div className='page-header'><h1>Reports</h1></div>
              <ul>
                <li><Link to='reportsTop10'>Top 10 Requests</Link></li>
                <li><Link to='reportsAll'>All Requests</Link></li>
              </ul>
            </div>
            )
          }
          {authorization && selected === 'reportsTop10' &&
            (<div>
              <div className='page-header'><h1>Reports</h1></div>
              <p className='lead'>Top 10 Requests</p>

              <Reports report='stats.top10' />
            </div>
            )
          }
          {authorization && selected === 'reportsAll' &&
            (<div>
              <div className='page-header'><h1>Reports</h1></div>
              <p className='lead'>All Requests</p>
              <Reports report='stats' />
            </div>
            )
          }
          {authorization && selected === 'configuration' &&
            (<div>
              <div className='page-header'><h1>Configuration</h1></div>
              <ul>
                <li><Link to='wap'>Wireless Access Point</Link></li>
                <li><Link to='webserver'>Web Server</Link></li>
                <li><Link to='userinterface'>User Interface</Link></li>
                <li><Link to='password'>Password</Link></li>
                <li><Link to='system'>System</Link></li>
              </ul>
            </div>
            )
          }
          {authorization && selected === 'wap' &&
            (<div>
              <div className='page-header'><h1>Wireless Access Point</h1></div>
              <ul>
                <li><Link to='wap-ssid'>SSID</Link></li>
                <li><Link to='wap-channel'>Channel</Link></li>
                <li><Link to='wap-wpa-passphrase'>WPA Passphrase</Link></li>
              </ul>
            </div>
            )
          }
          {authorization && selected === 'wap-ssid' &&
            (<div>
              <div className='page-header'><h1>Wireless Access Point</h1></div>
              <p className='lead'>Configure the SSID broadcast by the Wireless Access Point</p>
              <Ssid />
            </div>
            )
          }
          {authorization && selected === 'wap-channel' &&
            (<div>
              <div className='page-header'><h1>Wireless Access Point</h1></div>
              <p className='lead'>Configure the channel used by the Wireless Access Point</p>
              <Channel />
            </div>
            )
          }
          {authorization && selected === 'wap-wpa-passphrase' &&
            (<div>
              <div className='page-header'><h1>Wireless Access Point</h1></div>
              <p className='lead'>Configure a WPA Passphrase used by the Wireless Access Point</p>
              <WpaPassphrase />
            </div>
            )
          }
          {authorization && selected === 'webserver' &&
            (<div>
              <div className='page-header'><h1>Web Server</h1></div>
              <ul>
                <li><Link to='webserver-staticsite'>Static site configuration</Link></li>
                <li><Link to='webserver-hostname'>Hostname</Link></li>
              </ul>
            </div>
            )
          }
          {authorization && selected === 'webserver-staticsite' &&
            (<div>
              <div className='page-header'><h1>Web Server</h1></div>
              <p className='lead'>Static site configuration</p>
              <StaticSite />
            </div>
            )
          }
          {authorization && selected === 'webserver-hostname' &&
            (<div>
              <div className='page-header'><h1>Web Server</h1></div>
              <p className='lead'>Web server hostname</p>
              <Hostname path='admin/webserver-hostname' />
            </div>
            )
          }
          {authorization && selected === 'userinterface' &&
            (<div>
              <div className='page-header'><h1>User Interface</h1></div>
              <p className='lead'>Banner Message (html or plain text)</p>
              <Banner />
            </div>
            )
          }
          {authorization && selected === 'password' &&
            (<div>
              <div className='page-header'><h1>Admin Password</h1></div>
              <p className='lead'>Configure the admin dashboard password</p>
              <Password />
            </div>
            )
          }
          {authorization && selected === 'system' &&
            (<div>
              <div className='page-header'><h1>System</h1></div>
              <p className='lead'>System Functions</p>

              <System />
            </div>
            )
          }
        </div>
        <div className='spacer' />
        <div className='dashboardFooter' >
          <span className='footerText'>ConnectBox - <i>share media with wifi</i></span>
          <span className='spacer' />
          <span className='footerText'>{version}</span>
        </div>
      </div>
    )
  }
}

AdminPanel.propTypes = {
  authorization: PropTypes.string,
  checkAuthenticated: PropTypes.func.isRequired,
  propertyUpdating: PropTypes.bool.isRequired,
  version: PropTypes.string.isRequired
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AdminPanel))
