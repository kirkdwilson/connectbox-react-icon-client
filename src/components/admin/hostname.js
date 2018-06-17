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
  const { adminError, adminLoadError, latestPropUpdate, prop_hostname, propertyTimeoutWait, propertyUpdating } = state
  return { adminError, adminLoadError, hostname: prop_hostname, latestPropUpdate, propertyTimeoutWait, propertyUpdating }
}

const mapDispatchToProps = {
  getProperty,
  setProperty
}

const displayName = 'Hostname'

class Hostname extends Component {
  constructor (props) {
    super(props)

    this.state = {
      hostname: props.hostname,
      updating: false,
      showUpdateDialog: false,
      adminError: null,
      adminLoadError: null,
      waiting: false,
      timeoutError: null
    }
  }

  componentWillMount () {
    this.props.getProperty('hostname') // api call triggering authentication
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
      if (nextProps.latestPropUpdate === 'hostname' && this.state.updating) {
        this.setState({hostname: nextProps.hostname, showUpdateDialog: true})
      } else {
        this.setState({hostname: nextProps.hostname})
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
    const hostname = evt.target.value
    this.setState({hostname})
  }

  handleUpdate = () => {
    const { setProperty } = this.props
    const { hostname } = this.state
    this.setState({updating: true})
    setProperty('hostname', hostname)
  }

  clearDialog = () => {
    const { path } = this.props
    const { hostname } = this.state
    window.location.href = `http://${hostname}/${path}`
  }

  render () {
    const { propertyUpdating } = this.props
    const { adminError, adminLoadError, hostname, showUpdateDialog, timeoutError } = this.state

    return (
      <div className='admin-component'>
        {adminError && 
          <ConfirmDialog
          isOpen={showUpdateDialog}
          title={`${displayName} not updated`}
          body={`${adminError}`}
          handleOk={this.clearDialog}/>
        }
        {adminLoadError && 
          <ConfirmDialog
          isOpen={showUpdateDialog}
          title={`Unable to load ${displayName} setting`}
          body={`${adminLoadError}`}
          handleOk={this.clearDialog}/>
        }
        {timeoutError &&
          <ConfirmDialog
            isOpen={showUpdateDialog}
            title={`Host name updated to '${hostname}'`}
            body={`Host name updated to ${hostname}, click OK to continue`}
            handleOk={this.clearDialog}/>
        }
        {!adminError &&
          !timeoutError &&
          <ConfirmDialog
            isOpen={showUpdateDialog}
            title={`Host name updated to '${hostname}'`}
            body={`Host name updated to ${hostname}, click OK to continue`}
            handleOk={this.clearDialog}/>
        }
        <form className='form-inline'>
          <input className='string form-control admin-input' type='text' value={hostname} onChange={this.handleInputUpdate} size='25'/>
          <button className='btn btn-default' onClick={this.handleUpdate} disabled={propertyUpdating}>Update</button>
        </form>
      </div>
    )
  }
}

Hostname.propTypes = {
  adminError: PropTypes.string,
  adminLoadError: PropTypes.string,
  hostname: PropTypes.string.isRequired,
  getProperty: PropTypes.func.isRequired,
  latestPropUpdate: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  propertyUpdating: PropTypes.bool.isRequired,
  setProperty: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Hostname)
