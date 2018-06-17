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
  const { adminError, adminLoadError, latestPropUpdate, prop_channel, propertyUpdating, propertyTimeoutWait } = state
  return { adminError, adminLoadError, channel: prop_channel, latestPropUpdate, propertyUpdating, propertyTimeoutWait }
}

const mapDispatchToProps = {
  getProperty,
  setProperty
}

const displayName = 'Channel'

class Channel extends Component {
  constructor (props) {
    super(props)

    this.state = {
      channel: props.channel,
      updating: false,
      showUpdateDialog: false,
      adminError: null,
      adminLoadError: null,
      waiting: false,
      timeoutError: null
    }
  }

  componentWillMount () {
    this.props.getProperty('channel') // api call triggering authentication
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
      if (nextProps.latestPropUpdate === 'channel' && this.state.updating) {
        this.setState({channel: nextProps.channel, showUpdateDialog: true})
      } else {
        this.setState({channel: nextProps.channel})
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
    const channel = evt.target.value
    this.setState({channel})
  }

  handleUpdate = () => {
    const { setProperty } = this.props
    const { channel } = this.state
    this.setState({updating: true})
    setProperty('channel', channel, true, 5000, 10000)
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
      getProperty('channel')
    }
  }

  render () {
    const { propertyUpdating } = this.props
    const { adminError, adminLoadError, timeoutError, channel, showUpdateDialog } = this.state
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
            title='Wireless channel updating'
            body={`Update your wireless network settings, then click OK to continue.`}
            handleOk={this.clearDialog}/>
        }
        {!adminError &&
          !timeoutError &&
          <ConfirmDialog
          isOpen={showUpdateDialog}
          title='Wireless channel successfully updated'
          body={`Wireless channel updated to '${channel}'`}
          handleOk={this.clearDialog}/>
        }
        <form className='form-inline'>
          <select
            className="string form-control admin-input"
            onChange={this.handleInputUpdate}
            value={channel}>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
            <option>6</option>
            <option>7</option>
            <option>8</option>
            <option>9</option>
            <option>10</option>
            <option>11</option>
          </select>
          <button 
            className='btn btn-default'
            onClick={this.handleUpdate} 
            disabled={propertyUpdating}>Update</button>
        </form>
      </div>
    )
  }
}

Channel.propTypes = {
  adminError: PropTypes.string,
  adminLoadError: PropTypes.string,
  channel: PropTypes.string.isRequired,
  getProperty: PropTypes.func.isRequired,
  latestPropUpdate: PropTypes.string.isRequired,
  propertyTimeoutWait: PropTypes.bool.isRequired,
  propertyUpdating: PropTypes.bool.isRequired,
  setProperty: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Channel)
