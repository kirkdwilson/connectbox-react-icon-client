import './admin-component.css'

import { get } from 'lodash'
import { connect } from 'react-redux'
import ConfirmDialog from './confirm-dialog'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {
  setProperty,
  getProperty
} from '../../redux'

function mapStateToProps (state) {
  const { adminError, adminLoadError, latestPropUpdate, prop_ui_config, propertyUpdating } = state
  return { adminError, adminLoadError, ui_config: prop_ui_config, latestPropUpdate, propertyUpdating }
}

const mapDispatchToProps = {
  getProperty,
  setProperty
}

const displayName = 'Banner'

class Banner extends Component {
  constructor (props) {
    super(props)
    this.state = {
      ui_config: null,
      updating: false,
      showUpdateDialog: false,
      adminError: null,
      adminLoadError: null
    }
  }

  componentWillMount () {
    this.props.getProperty('ui-config')
  }

  componentWillReceiveProps (nextProps) {
    const { ui_config } = nextProps
    if (nextProps.adminError) {
      this.setState({adminError: nextProps.adminError, showUpdateDialog: true})
    } else if (nextProps.adminLoadError) {
      this.setState({adminLoadError: nextProps.adminLoadError, showUpdateDialog: true})
    } else {
      if (nextProps.latestPropUpdate === 'ui_config' && this.state.updating) {
        this.setState({ui_config, updating: false, showUpdateDialog: true})
      } else {
        this.setState({ui_config})
      }
    }
  }

  handleInputUpdate = (evt) => {
    const banner = evt.target.value
    const { ui_config } = this.state
    ui_config.Client.banner = banner
    this.setState({ui_config})
  }

  handleUpdate = () => {
    const { setProperty } = this.props
    const { ui_config } = this.state
    this.setState({updating: true})
    setProperty('ui-config', ui_config, false)
  }

  clearDialog = () => {
    this.setState({showUpdateDialog: false})
  }

  render () {
    const { propertyUpdating } = this.props
    const { adminError, adminLoadError, ui_config, showUpdateDialog } = this.state

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
        {!adminError &&
        <ConfirmDialog
          isOpen={showUpdateDialog}
          title='Banner updated'
          body={`Banner successfully updated`}
          handleOk={this.clearDialog}/>
        }
        <form className='form-inline'>
          <textarea className='string form-control' rows="4" cols="80" onChange={this.handleInputUpdate} value={get(ui_config, 'Client.banner')}></textarea><br />
          <button style={{marginTop: '10px'}}  className='btn btn-default' onClick={this.handleUpdate} disabled={propertyUpdating}>Update</button>
        </form>
      </div>
    )
  }
}

Banner.propTypes = {
  adminError: PropTypes.string,
  adminLoadError: PropTypes.string,
  ui_config: PropTypes.object,
  getProperty: PropTypes.func.isRequired,
  latestPropUpdate: PropTypes.string.isRequired,
  propertyUpdating: PropTypes.bool.isRequired,
  setProperty: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Banner)
