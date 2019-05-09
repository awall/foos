class Login extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            redirect: false,
            failed: false,
        }

        this.login = this.login.bind(this)
    }

    login(event) {
        // we need this to stop the default behaviour, which is posting to "/" using the username and password as query parameters
        event.preventDefault()

        let auth = this.props.auth

        axios
            .post('/api/login', {
                username: this.refs.username.value,
                password: this.refs.password.value,
            })
            .then(response => {
                auth.setAuthToken(response.data)
                this.setState({
                    failed: false,
                    redirect: true,
                })
            })
            .catch(response => {
                auth.clearAuthToken()
                this.setState({
                    failed: true,
                    redirect: false,
                })
            })
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to="/" />
        }

        return modal(
            <form onSubmit={ this.login }>
                Username
                <br />
                <input type="text" name="username" ref="username" />
                <br />
                <br />
                Password
                <br />
                <input type="password" name="password" ref="password" />
                <br />
                <br />

                { this.state.failed
                    ? <div class="error">Invalid username or password.<br /><br /></div>
                    : null
                }

                <input type="submit" value="Sign In" />
            </form>
        )
    }
}

class UserMenu extends React.Component {
    constructor(props) {
        super(props)

        this.logout = this.logout.bind(this)
    }

    logout() {
        this.props.auth.clearAuthToken()
    }

    render() {
        let auth = this.props.auth
        let token = auth.token
        let user = token.username

        return (
            <div className="menu">
                <div id="avatar" className="menu-top">
                    { user == null ? '[not logged in]' : user }
                </div>
                <div className="menu-popup">
                    { user == null ? null : <div className="menu-info">logged in as { user }</div> }
                    { user == null
                        ? <Link to="/login"><div className="menu-action">log in</div></Link>
                        : <div className="menu-action" onClick={ this.logout }>log out</div> }
                </div>
            </div>
        )
    }
}

const OtherMenu = () => (
    <div className="menu">
        <div className="menu-top">Random Stuff</div>
        <div className="menu-popup">
            <div className="menu-info">Some info</div>
            <div className="menu-action">Some action #1</div>
            <div className="menu-action">Some action #2</div>
        </div>
    </div>
)

const Toolbar = ({auth}) => (
    <div id="toolbar">
        <div id="bigbar">
            BIG BAR CONTENT HERE
        </div>
        <div id="smallbar">
            <OtherMenu />
            <UserMenu auth={auth} />
        </div>
    </div>
)

class Main extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            value: 'WAITING...'
        }
    }

    componentDidMount() {
        axios.get('/api/hello').then(response =>
            this.setState({
                value: response.data
            })
        )
    }

    render() {
        return (
            <div>
                <Toolbar auth={this.props.auth} />
                <div id="main">
                    { this.state.value }
                </div>
            </div>
        )
    }
}

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            authToken: {},
        }

        this.setAuthToken = this.setAuthToken.bind(this)
        this.clearAuthToken = this.clearAuthToken.bind(this)
    }

    setAuthToken(data) {
        sessionStorage.setItem("foosAuthToken", JSON.stringify(data))
        this.reloadAuthToken()
    }

    clearAuthToken() {
        sessionStorage.removeItem("foosAuthToken")
        this.reloadAuthToken()
    }

    reloadAuthToken() {
        let rawToken = sessionStorage.getItem("foosAuthToken")
        let token = rawToken ? JSON.parse(rawToken) : {}
        this.setState({
            authToken: token,
        })
    }

    componentDidMount() {
        this.reloadAuthToken()
    }

    render() {
        let auth = {
            token: this.state.authToken,
            clearAuthToken: this.clearAuthToken,
            setAuthToken: this.setAuthToken,
        }

        return (
            <HashRouter>
                <Route path="/" render={ props => <Main {...props} auth={auth} />} />
                <Route path="/login" exact  render={ props => <Login {...props} auth={auth} />} />
            </HashRouter>
        )
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
)
