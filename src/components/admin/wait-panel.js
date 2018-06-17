import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

function mapStateToProps (state) {
  const { propertyUpdating } = state
  return { propertyUpdating }
}

const mapDispatchToProps = {}

class WaitPanel extends Component {
  render () {
    const { propertyUpdating } = this.props
    return propertyUpdating && <div className='dialog-overlay'><span className='waiting-modal loader' /></div>
  }
}

WaitPanel.propTypes = {
  propertyUpdating: PropTypes.bool.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(WaitPanel)
