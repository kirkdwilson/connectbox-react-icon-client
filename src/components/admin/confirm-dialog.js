import './confirm-dialog.css'
import ReactModal from 'react-modal'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

class ConfirmDialog extends Component {
  render () {
    const {isOpen, title, body, handleOk} = this.props
    return (
      <ReactModal
        isOpen={isOpen}
        contentLabel={title}
        className='dialog'
        overlayClassName='dialog-overlay'>
        <span className='dialog-header'>{title}</span>
        <div className='dialog-body'>{body}</div>
        <button className='dialog-button' onClick={handleOk}>OK</button>
      </ReactModal>
    )
  }
}

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  handleOk: PropTypes.func.isRequired
}

export default ConfirmDialog
