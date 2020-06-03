/* global window */
import './ConnectBoxApp.css'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import queryString from 'query-string'
import { Redirect, Route, Switch, withRouter } from 'react-router'

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
import Footer from './components/Footer'
import AdminPanel from './components/admin/dashboard'

function mapStateToProps (state) {
  const {
    chatPanelShowing,
    chatOffline,
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
    chatOffline,
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
      const { config: { Client: { chat_disabled } } } = this.props
      if (!this.props.location.pathname.startsWith('/admin/') && !chat_disabled) {
        this.props.getNewMessages()
      }
    }

    reload (e) {
      const { contentPath, getContent } = this.props
      getContent(contentPath)
      e.preventDefault()
    }

    onChatClick = () => {
      const { chatOffline } = this.props
      if (chatOffline) {
        return
      }
      this.props.toggleChatPanel(true)
    }

    renderChat = () => {
      const { chat_disabled } = this.props.config.Client
      if ( !chat_disabled ) {
        return (
          <ChatPanel />
        )
      } else {
        return null
      }
    }

    banner () {
      const { banner } = this.props.config.Client

      if (banner) {
        return (<div dangerouslySetInnerHTML={{__html: banner}}></div>)
      }

      return null
    }

    renderChatButton = () => {
      const { mention, newMessages, chatOffline, config: { Client: { chat_disabled } } } = this.props
      if ( !chat_disabled ) {
        const newMessageOnClass = !mention && newMessages ? 'chat-new-message-on' : ''
        const newMessageOffClass = !mention && newMessages ? 'chat-new-message-off' : ''
        const mentionClass = mention ? 'chat-mention' : ''
        const chatOfflineClass = chatOffline ? 'chat-offline' : ''
        return (
          <div className='chat-button' onClick={this.onChatClick}>
            <i
              style={{position: 'absolute', top: 0, right: 10, display: !mention && newMessages ? 'block' : 'none'}}
              className={`fa fa-comments-o fa-lg chat-icon ${newMessageOnClass} ${chatOfflineClass}`}
              aria-hidden='true'></i>
            <i
              style={{position: 'absolute', top: 0, right: 10, display: !mention && newMessages ? 'block' : 'none'}}
              className={`fa fa-comments fa-lg chat-icon ${newMessageOffClass} ${chatOfflineClass}`}
              aria-hidden='true'></i>
            <i
              style={{position: 'absolute', top: 0, right: 10, display: !newMessages ? 'block' : 'none'}}
              className={`fa fa-comments fa-lg chat-icon ${mentionClass} ${chatOfflineClass}`}
              aria-hidden='true'></i>
          </div>
        )
      } else {
        return null;
      }
    }

    renderContent = () => {
      const {showScrollToTop} = this.state
      const { content, contentPath, config, error, iconMetadata, topLevelFiles, loading, popularFiles } = this.props

      const isRoot = contentPath === '' || contentPath === '/'

      return (
        <div style={{height: 'calc(100%)'}}>
          {this.banner()}
          <div className="content-panel">
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
                <div style={{marginTop: "3em"}}>
                  <RootFolderList
                    iconMetadata={iconMetadata}
                    contentRoot={config.Content.contentRoute}
                    displayFolderName={config.Client.display_root_folder_names}
                    content={content}
                    />
                </div>
              }

              {!error && !isRoot &&
                <div style={{marginTop: "3em"}}>
                    <FolderList
                      iconMetadata={iconMetadata}
                      folderPath={contentPath}
                      contentRoot={config.Content.contentRoute}
                      content={content}/>
                </div>
              }

              {!error && isRoot && topLevelFiles &&
                <div>
                    <FolderList
                      iconMetadata={iconMetadata}
                      folderPath=''
                      contentRoot={config.Content.contentRoute}
                      content={topLevelFiles}/>
                </div>
              }

              {!error && popularFiles && popularFiles.length > 0 && isRoot &&
                  <div>
                      <PopularFileList popularFiles={popularFiles}/>
                  </div>
              }

              {error &&
                <div style={{marginTop: '60px'}}>
                      <div className="alert alert-danger" role="alert">
                          <big>
                              Error occurred: "{ error || 'Unexpected error' }"
                          </big>
                      </div>
                  </div>
              }
            <div className='spacer' />
            <Footer />
          </div>
        </div>
      )
    }

  render () {
    const { chatPanelShowing } = this.props

    return (
      <Switch>
        <Route strict path='/admin/' component={AdminPanel} />

        <Route exact path='/admin' >
          <Redirect to="/admin/" />
        </Route>

        <Route render={props => (chatPanelShowing ? this.renderChat() : this.renderContent())} />
      </Switch>
    )
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ConnectBoxApp))
