import './admin-component.css'

import { connect } from 'react-redux'
import ConfirmDialog from './confirm-dialog'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {
  setProperty
} from '../../redux'

function mapStateToProps (state) {
  const { adminError, adminLoadError, latestPropUpdate, prop_passphrase, propertyUpdating, propertyTimeoutWait } = state
  return { adminError, adminLoadError, passphrase: prop_passphrase, latestPropUpdate, propertyUpdating, propertyTimeoutWait }
}

const mapDispatchToProps = {
  setProperty
}

const displayName = 'WPA Passphrase'

class WpaPassphrase extends Component {
  constructor (props) {
    super(props)

    this.state = {
      passphrase: '',
      updating: false,
      showUpdateDialog: false,
      adminError: null,
      adminLoadError: null,
      timeoutError: null,
      waiting: false
    }
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
      if (nextProps.latestPropUpdate === 'wpa_passphrase' && this.state.updating) {
        this.setState({showUpdateDialog: true})
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
    const passphrase = evt.target.value
    this.setState({passphrase})
  }

  handleUpdate = () => {
    const { setProperty } = this.props
    const { passphrase } = this.state
    this.setState({updating: true})
    setProperty('wpa-passphrase', passphrase, true, 5000, 10000)
  }

  clearDialog = () => {
    this.setState({
      showUpdateDialog: false,
      loadError: null,
      timeoutError: null,
      adminError: null,
      updating: false,
      waiting: false
    })
  }

  render () {
    const { propertyUpdating } = this.props
    const { adminError, adminLoadError, passphrase, timeoutError, showUpdateDialog } = this.state
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
            title={`${passphrase ? 'WPA Passphrase updated to "' + passphrase + '"': 'WPA Passphrase removed'}`}
            body={`Update your wireless network settings, then click OK to continue.`}
            handleOk={this.clearDialog}/>
        }
        {!adminError &&
          !timeoutError &&
          <ConfirmDialog
            isOpen={showUpdateDialog}
            title={`${passphrase ? 'WPA Passphrase updated to "' + passphrase + '"' : 'WPA Passphrase removed'}`}
            body={`Update your wireless network settings, then click OK to continue.`}
            handleOk={this.clearDialog}/>
        }
        <form className='form-inline'>
          <input
              className='string form-control admin-input'
              type='text'
              value={passphrase}
              onChange={this.handleInputUpdate}/>
          <button
            className='btn btn-default'
            placeholder='Enter WPA Passphrase'
            onClick={this.handleUpdate}
            disabled={propertyUpdating}>Update</button>
        </form>
      </div>
    )
  }
}

WpaPassphrase.propTypes = {
  adminError: PropTypes.string,
  adminLoadError: PropTypes.string,
  latestPropUpdate: PropTypes.string.isRequired,
  propertyUpdating: PropTypes.bool.isRequired,
  propertyTimeoutWait: PropTypes.bool.isRequired,
  setProperty: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(WpaPassphrase)
