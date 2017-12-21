/* global window */
import './ConnectBoxApp.css'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import queryString from 'query-string'
import { withRouter } from 'react-router'

import {
  fetchNick,
  fetchTextDirection,
  getContent,
  getMessages,
  getNewMessages,
  setConfigPath,
  toggleChatPanel
} from './redux'
import ChatPanel from './components/ChatPanel'
import NavigationBar from './components/NavigationBar'
import PopularFileList from './components/PopularFileList'
import RootFolderList from './components/RootFolderList'
import FolderList from './components/FolderList'

function mapStateToProps (state) {
  const {
    chatPanelShowing,
    content,
    contentPath,
    config,
    error,
    iconMetadata,
    loading,
    mention,
    newMessages,
    popularFiles,
    topLevelFiles
  } = state
  return {
    chatPanelShowing,
    content,
    contentPath,
    config,
    error,
    iconMetadata,
    loading,
    mention,
    newMessages,
    popularFiles,
    topLevelFiles
  }
}

const mapDispatchToProps = {
  fetchNick,
  fetchTextDirection,
  getContent,
  getMessages,
  getNewMessages,
  setConfigPath,
  toggleChatPanel
}

export class ConnectBoxApp extends Component {
    static propTypes = {
        chatPanelShowing: PropTypes.bool.isRequired,
        config: PropTypes.object.isRequired,
        content: PropTypes.array.isRequired,
        error: PropTypes.object,
        getContent: PropTypes.func.isRequired,
        getMessages: PropTypes.func.isRequired,
        getNewMessages: PropTypes.func.isRequired,
        history: PropTypes.object.isRequired,
        iconMetadata: PropTypes.object.isRequired,
        loading: PropTypes.bool.isRequired,
        location: PropTypes.object.isRequired,
        mention: PropTypes.bool.isRequired,
        newMessages: PropTypes.bool.isRequired,
        popularFiles: PropTypes.array,
        setConfigPath: PropTypes.func.isRequired,
        toggleChatPanel: PropTypes.func.isRequired,
        topLevelFiles: PropTypes.array
    }

    constructor (props) {
        super(props)

        this.state = {showScrollToTop: false};

        this.scrollListener = this.scrollListener.bind(this)
        this.scrollToTop = this.scrollToTop.bind(this)
        this.reload = this.reload.bind(this)
    }

    scrollListener () {
      this.scrollDebounce && clearTimeout(this.scrollDebounce)
      this.setState({
        showScrollToTop: window.scrollY > 150
      })
      this.scrollDebounce = setTimeout(Function.prototype, 500)
    }

    scrollToTop (e) {
      this.scrollTicker && clearInterval(this.scrollTicker);
      this.scrollTicker = setInterval(() => {
              var y = 0.6 * window.scrollY;
              if (y < 100) {
                  y = 0;
                  clearInterval(this.scrollTicker);
              }
              window.scrollTo(0, y);
          }, 10);
      e.preventDefault()
    }

    componentDidMount () {
      this.props.fetchNick()
      this.props.fetchTextDirection()
      this.props.getContent(this.props.location.hash.substring(1))
      this.historyUnlisten = this.props.history.listen((location, action) => {
        this.props.getContent(location.hash.substring(1))
      });

      window.addEventListener('scroll', this.scrollListener)

      this.props.getMessages()
      this.refreshInterval = setInterval(this.refreshMessages, 3000)
    }

    componentWillUnmount () {
      clearInterval(this.refreshInterval)
      if (this.historyUnlisten) {
        this.historyUnlisten()
      }
      window.removeEventListener('scroll', this.scrollListener)
    }

    componentWillMount () {
      const queryParams = queryString.parse(this.props.location.search)
      this.props.setConfigPath(queryParams.config)
    }

    refreshMessages = () => {
      this.props.getNewMessages()
    }

    reload (e) {
      const { contentPath, getContent } = this.props
      getContent(contentPath)
      e.preventDefault()
    }

    onChatClick = () => {
      this.props.toggleChatPanel(true)
    }

    renderChat = () => {
      return (
        <ChatPanel />
      )
    }

    banner () {
      const { banner } = this.props.config.Client

      if (banner) {
        return (<div dangerouslySetInnerHTML={{__html: banner}}></div>)
      }

      return null
    }

    renderChatButton = () => {
      const { mention, newMessages } = this.props
      const newMessageOnClass = !mention && newMessages ? 'chat-new-message-on' : ''
      const newMessageOffClass = !mention && newMessages ? 'chat-new-message-off' : ''
      const mentionClass = mention ? 'chat-mention' : ''
      return (
        <div className='chat-button' onClick={this.onChatClick}>
          <i
            style={{position: 'absolute', top: 0, right: 0, display: !mention && newMessages ? 'block' : 'none'}}
            className={`fa fa-comments-o fa-lg chat-icon ${newMessageOnClass}`}
            aria-hidden='true'></i>
          <i
            style={{position: 'absolute', top: 0, right: 0, display: !mention && newMessages ? 'block' : 'none'}}
            className={`fa fa-comments fa-lg chat-icon ${newMessageOffClass}`}
            aria-hidden='true'></i>
          <i
            style={{position: 'absolute', top: 0, right: 0, display: !newMessages ? 'block' : 'none'}}
            className={`fa fa-comments fa-lg chat-icon ${mentionClass}`}
            aria-hidden='true'></i>
        </div>
      )
    }

    renderContent = () => {
      const {showScrollToTop} = this.state
      const { content, contentPath, config, error, iconMetadata, topLevelFiles, loading, popularFiles } = this.props

      const isRoot = contentPath === '' || contentPath === '/'

      return (
        <div style={{margin: '0px', padding: '0px'}}>
          {this.banner()}
          <div className="container-fluid">
            {showScrollToTop &&
              <div className="pull-right" id="scroll-to-top">
              <a role="button" onClick={this.scrollToTop}><i className="fa fa-long-arrow-up"></i> to top</a></div>
            }

          <div className="navigation-bar">
              <NavigationBar
                contentPath={contentPath}
                reload={this.reload}
                loading={loading}/>
              {this.renderChatButton()}
          </div>

            {!error && isRoot &&
              <div className="row" style={{marginTop: "3em"}}>
                <RootFolderList
                  iconMetadata={iconMetadata}
                  contentRoot={config.Content.contentRoute}
                  displayFolderName={config.Client.display_root_folder_names}
                  content={content}
                  />
              </div>
            }

            {!error && !isRoot &&
              <div className="row" style={{marginTop: "3em"}}>
                  <FolderList
                    iconMetadata={iconMetadata}
                    folderPath={contentPath}
                    contentRoot={config.Content.contentRoute}
                    content={content}/>
              </div>
            }

            {!error && isRoot && topLevelFiles &&
              <div className="row">
                  <FolderList
                    iconMetadata={iconMetadata}
                    folderPath=''
                    contentRoot={config.Content.contentRoute}
                    content={topLevelFiles}/>
              </div>
            }

            {!error && popularFiles && popularFiles.length > 0 && isRoot &&
                <div className="row">
                    <PopularFileList popularFiles={popularFiles}/>
                </div>
            }

            {error &&
              <div className="row" style={{marginTop: '60px'}}>
                    <div className="alert alert-danger" role="alert">
                        <big>
                            Error occurred: "{ error || 'Unexpected error' }"
                        </big>
                    </div>
                </div>
            }
          </div>
        </div>
      )
    }

  render () {
    const { chatPanelShowing } = this.props

    if (chatPanelShowing) {
      return this.renderChat()
    } else {
      return this.renderContent()
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ConnectBoxApp))
