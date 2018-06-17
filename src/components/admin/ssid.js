import './admin-component.css'

import { connect } from 'react-redux'
import ConfirmDialog from './confirm-dialog'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {
  setProperty,
  getProperty
} from '../../redux'

function mapStateToProps (state) {
  const { adminError, adminLoadError, latestPropUpdate, prop_ssid, propertyUpdating, propertyTimeoutWait } = state
  return { adminError, adminLoadError, ssid: prop_ssid, latestPropUpdate, propertyUpdating, propertyTimeoutWait }
}

const mapDispatchToProps = {
  getProperty,
  setProperty
}

const displayName = 'SSID'

class Ssid extends Component {
  constructor (props) {
    super(props)

    this.state = {
      ssid: props.ssid,
      updating: false,
      showUpdateDialog: false,
      adminError: null,
      adminLoadError: null,
      timeoutError: null,
      waiting: false
    }
  }

  componentWillMount () {
    this.props.getProperty('ssid') // api call triggering authentication
  }

  componentWillReceiveProps (nextProps) {
    const { propertyUpdating } = nextProps
    const { waiting } = this.state
    if (nextProps.propertyTimeoutWait) {
      this.setState({waiting: true})
    }

    if (nextProps.adminError) {
      if (waiting) {
        this.setState({timeoutError: nextProps.adminError, showUpdateDialog: true})
      } else {
        this.setState({adminError: nextProps.adminError, showUpdateDialog: true})
      }
    } else if (nextProps.adminLoadError) {
      this.setState({adminLoadError: nextProps.adminLoadError, showUpdateDialog: true})
    } else {
      if (nextProps.latestPropUpdate === 'ssid' && this.state.updating) {
        this.setState({ssid: nextProps.ssid, showUpdateDialog: true})
      } else {
        this.setState({ssid: nextProps.ssid})
      }
    }

    // Clear updating
    if (!propertyUpdating && this.state.updating) {
      this.setState({updating: false})
    }
    if (!nextProps.propertyTimeoutWait && this.state.waiting) {
      this.setState({waiting: false})
    }
  }

  handleInputUpdate = (evt) => {
    const ssid = evt.target.value
    this.setState({ssid})
  }

  handleUpdate = () => {
    const { setProperty } = this.props
    const { ssid } = this.state
    this.setState({updating: true})
    setProperty('ssid', ssid, true, 5000, 10000)
  }

  clearDialog = () => {
    const { getProperty } = this.props
    const { timeoutError } = this.state
    this.setState({
      showUpdateDialog: false,
      loadError: null,
      timeoutError: null,
      adminError: null,
      updating: false,
      waiting: false
    })
    if (timeoutError) {
      getProperty('ssid')
    }
  }

  render () {
    const { propertyUpdating } = this.props
    const { adminError, adminLoadError, ssid, timeoutError, showUpdateDialog } = this.state
    return (
      <div className='admin-component'>
        {adminLoadError && 
          <ConfirmDialog
          isOpen={showUpdateDialog}
          title={`Unable to load ${displayName} setting`}
          body={`${adminLoadError}`}
          handleOk={this.clearDialog}/>
        }
        {(adminError || timeoutError) &&
          <ConfirmDialog
            isOpen={showUpdateDialog}
            title={`SSID updated to '${ssid}'`}
            body={`Update your wireless network settings, then click OK to continue.`}
            handleOk={this.clearDialog}/>
        }
        {!adminError &&
          !timeoutError &&
          <ConfirmDialog
            isOpen={showUpdateDialog}
            title={`SSID updated to '${ssid}'`}
            body={`Update your wireless network settings, then click OK to continue.`}
            handleOk={this.clearDialog}/>
        }
        <form className='form-inline'>
          <input
              className='string form-control admin-input'
              type='text'
              value={ssid}
              onChange={this.handleInputUpdate}/>
          <button
            className='btn btn-default'
            placeholder='Enter SSID'
            onClick={this.handleUpdate}
            disabled={propertyUpdating}>Update</button>
        </form>
      </div>
    )
  }
}

Ssid.propTypes = {
  adminError: PropTypes.string,
  adminLoadError: PropTypes.string,
  ssid: PropTypes.string.isRequired,
  getProperty: PropTypes.func.isRequired,
  latestPropUpdate: PropTypes.string.isRequired,
  propertyUpdating: PropTypes.bool.isRequired,
  propertyTimeoutWait: PropTypes.bool.isRequired,
  setProperty: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Ssid)
