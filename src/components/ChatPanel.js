import './ChatPanel.css'

import {
  clearMessageNotifications,
  saveNick,
  saveTextDirection,
  sendMessage,
  toggleChatPanel
} from '../redux'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'react-redux'
import { withRouter } from 'react-router'

function mapStateToProps (state) {
  const { messages, sentMessages, nick, textDirection } = state
  return { messages, sentMessages, nick, textDirection }
}

const mapDispatchToProps = {
  clearMessageNotifications,
  sendMessage,
  saveNick,
  saveTextDirection,
  toggleChatPanel
}

export class ChatPanel extends Component {
  static propTypes = {
    nick: PropTypes.string.isRequired,
    messages: PropTypes.object.isRequired,
    sendMessage: PropTypes.func.isRequired,
    sentMessages: PropTypes.array.isRequired,
    textDirection: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      editNick: false,
      messageInput: '',
      userScrolled: false
    }
  }

  componentDidMount () {
    this.props.clearMessageNotifications()
    this.updateMessagePanelScrollPosition()
  }

  componentDidUpdate () {
    this.updateMessagePanelScrollPosition()
  }

  componentWillUnmount () {
    this.props.clearMessageNotifications()
  }

  updateMessagePanelScrollPosition = () => {
    if (!this.state.userScrolled) {
      const messagesPanel = document.getElementById('messages-panel')
      messagesPanel.scrollTop = messagesPanel.scrollHeight
    }
  }

  handleShowEditNick = () => {
    this.setState({ editNick: true })
  }

  handleUpdateNick = (evt) => {
    if (evt.type === 'keyup' &&
        evt.keyCode !== 13) {
      return
    }

    this.setState({ editNick: false })
    this.props.saveNick(evt.target.value)
  }

  handleMessageUpdate = (evt) => {
    if (evt.type === 'keyup') {
      if (evt.keyCode === 13) {
        this.handleMessageSend()
        return
      }
    }
    this.setState({
      messageInput: evt.target.value
    })
  }

  handleMessageSend = () => {
    const { nick, textDirection } = this.props
    const { messageInput } = this.state
    if (messageInput.trim() === '') {
      return
    }
    this.props.sendMessage({
      body: messageInput,
      nick,
      textDirection
    })
    this.setState({
      messageInput: ''
    })
  }

  handleToggleTextDirection = () => {
    this.props.saveTextDirection(this.props.textDirection === 'ltr' ? 'rtl' : 'ltr')
  }

  handleScroll = (evt) => {
    const { scrollTop, scrollHeight, clientHeight } = evt.target
    this.setState({
      userScrolled: (scrollHeight - (scrollTop + clientHeight)) > 0
    })
  }

  renderNick = () => {
    const { nick } = this.props
    const { editNick } = this.state

    if (editNick) {
      return (
        <input
          id='input-nick'
          autoFocus
          type='text'
          className='input-nick'
          defaultValue={nick}
          onBlur={this.handleUpdateNick}
          onKeyUp={this.handleUpdateNick}></input>
      )
    } else {
      return (
        <div
          className='view-nick'
          onClick={this.handleShowEditNick}>
          {nick}
        </div>
      )
    }
  }

  handleCloseClick = () => {
    this.props.toggleChatPanel(false)
  }

  renderMessageBody = (message, mentionToken) => {
    const { body } = message
    const mentionIndex = message.body.indexOf(mentionToken)
    if (mentionIndex !== -1) {
      return (
        <span
          className='message-mention'>
          {body.substring(0, mentionIndex)}
          <strong>{mentionToken}</strong>
          {body.substring(mentionIndex + mentionToken.length)}
        </span>
      )
    } else {
      return message.body
    }
  }

  renderTextDirectionButton = () => {
    const { textDirection } = this.props
    const reversed = textDirection === 'rtl'
    return (
      <div
        className={
          `button-text-direction ${
            reversed ? 'horizontal-flip' : ''}`
        }
        onClick={this.handleToggleTextDirection}>
        <i
          className='fa fa-align-left fa-lg'
          aria-hidden='true'>
        </i>
      </div>
    )
  }

  render () {
    const { messages = {}, sentMessages, nick } = this.props
    const { messageInput } = this.state

    const messageArray = 
      Object.keys(messages)
        .reduce(
          (result, key) => [...result, messages[key]], [])
        .sort(
          (a, b) => a.id - b.id)
    const mentionToken = `@${nick}`
    return (
      <div className='chat-window'>
        <div
          className='close-button'
          onClick={this.handleCloseClick}>
          <i className='fa fa-times fa-lg' aria-hidden='true'></i>
        </div>
        <div className='content'>
          <div
            id='messages-panel'
            className='messages-panel'
            onScroll={this.handleScroll}>
            <div className='spacer' />
            {messageArray.map((message, i) => {
              const ts = new Date(0)
              ts.setUTCSeconds(message.timestamp)
              const isSent = sentMessages.includes(message.id) ||
                message.nick === nick
              const messageStyle = isSent ? 'sent-message' : 'message'
              const messageBodyStyle = isSent ? 'sent-message-body' : 'message-body'
              const nickStyle = isSent ? 'sent-message-nick' : 'message-nick'
              const { textDirection = 'ltr' } = message
              return (
                <div key={`msg${i}`} className={messageStyle}>
                  <div
                    key={`body${i}`}
                    className={messageBodyStyle}
                    style={{direction: textDirection}}>
                    {this.renderMessageBody(message, mentionToken)}
                  </div>
                  <div key={`nick${i}`} className={nickStyle}>
                    {ts.toLocaleDateString()} {ts.toLocaleTimeString()} - {message.nick}
                  </div>
                </div>
                )
              }
            )}
            <div className='message-panel-bottom'>
            </div>
          </div>
          <div className='input-panel'>
            {this.renderNick()}
            {this.renderTextDirectionButton()}
            <input
              type='text'
              className='input-message'
              onChange={this.handleMessageUpdate}
              onKeyUp={this.handleMessageUpdate}
              style={{direction: this.props.textDirection}}
              value={messageInput}
              autoFocus
              ></input>
            <div className='button-send' onClick={this.handleMessageSend}>
              <i className='fa fa-arrow-right fa-lg' aria-hidden='true'></i>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChatPanel))
