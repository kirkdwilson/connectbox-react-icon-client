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
  const { adminError, adminLoadError, latestPropUpdate, prop_staticsite, propertyUpdating } = state
  return { adminError, adminLoadError, staticsite: prop_staticsite, latestPropUpdate, propertyUpdating }
}

const mapDispatchToProps = {
  getProperty,
  setProperty
}

const displayName = 'Static Site Setting'

class StaticSite extends Component {
  constructor (props) {
    super(props)

    this.state = {
      staticsite: props.staticsite,
      updating: false,
      showUpdateDialog: false,
      adminError: null,
      adminLoadError: null
    }
  }

  componentWillMount () {
    this.props.getProperty('staticsite') // api call triggering authentication
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.adminError) {
      this.setState({adminError: nextProps.adminError, showUpdateDialog: true})
    } else if (nextProps.adminLoadError) {
      this.setState({adminLoadError: nextProps.adminLoadError, showUpdateDialog: true})
    } else {
      if (nextProps.latestPropUpdate === 'staticsite' && this.state.updating) {
        this.setState({staticsite: nextProps.staticsite, updating: false, showUpdateDialog: true})
      } else {
        this.setState({staticsite: nextProps.staticsite})
      }
    }
  }

  handleInputUpdate = (evt) => {
    const staticsite = evt.target.value
    this.setState({staticsite})
  }

  handleUpdate = () => {
    const { setProperty } = this.props
    const { staticsite } = this.state
    this.setState({updating: true})
    setProperty('staticsite', staticsite)
  }

  clearDialog = () => {
    this.setState({showUpdateDialog: false})
  }

  render () {
    const { propertyUpdating } = this.props
    const { adminError, adminLoadError, staticsite, showUpdateDialog } = this.state
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
            title={`Static site ${staticsite === 'true' ? 'enabled' : 'disabled'}`}
            body={`Static site is now ${staticsite === 'true' ? 'enabled' : 'disabled'}`}
            handleOk={this.clearDialog}/>
        }
        <form className='form-inline'>
          <div className='form-group' style={{paddingRight: '5px'}}>
            <label>
              <input type='radio' value='true' checked={staticsite === 'true'} onChange={this.handleInputUpdate}/> Enabled 
            </label>
          </div>
          <div className='form-group' style={{paddingRight: '10px'}}>
            <label>
              <input type='radio' value='false' checked={staticsite !== 'true'} onChange={this.handleInputUpdate}/> Disabled
            </label>
          </div>
        
          <button className='btn btn-default' onClick={this.handleUpdate} disabled={propertyUpdating}>Update</button>
        </form>
      </div>
    )
  }
}

StaticSite.propTypes = {
  adminError: PropTypes.string,
  adminLoadError: PropTypes.string,
  staticsite: PropTypes.string.isRequired,
  getProperty: PropTypes.func.isRequired,
  latestPropUpdate: PropTypes.string.isRequired,
  propertyUpdating: PropTypes.bool.isRequired,
  setProperty: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(StaticSite)
