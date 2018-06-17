import './admin-component.css'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  authenticate
} from '../../redux'

function mapStateToProps (state) {
  const { authorization } = state
  return { authorization }
}

const mapDispatchToProps = {
  authenticate
}

class Login extends Component {
  constructor (props) {
    super(props)

    this.state = {
      authenticating: false,
      authenticationError: false,
      password: ''
    }
  }

  componentWillReceiveProps (nextProps) {
    const { authenticating } = this.state
    const { authorization } = nextProps
    if (authenticating && !authorization) {
      this.setState({authenticating: false, authenticationError: true})
    }
  }

  handlePasswordChange = (evt) => {
    const password = evt.target.value
    this.setState({password})
  }

  handleAuthenticate = () => {
    const { authenticate } = this.props
    const { password } = this.state
    this.setState({authenticating: true, authenticationError: false})
    authenticate(password)
  }

  render () {
    const { authenticating, authenticationError, password } = this.state
    const className = authenticationError ? 'required' : ''
    return (
      <div>
        <div>
          <span></span>
          <label>
            <input
              className={className}
              type='password'
              value={password}
              onChange={this.handlePasswordChange} />
            Password
          </label>
        </div>
        <button
          className='btn btn-default'
          onClick={this.handleAuthenticate}
          disabled={authenticating}>Login</button>
      </div>
    )
  }
}

Login.propTypes = {
  authorization: PropTypes.string,
  authenticate: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
