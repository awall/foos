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
                auth.setToken(response.data)
                this.setState({
                    failed: false,
                    redirect: true,
                })
            })
            .catch(response => {
                auth.clearToken()
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
        this.props.auth.clearToken()
    }

    render() {
        let auth = this.props.auth
        let user = auth.username

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
            username: null,
        }

        this.setToken = this.setToken.bind(this)
        this.clearToken = this.clearToken.bind(this)
    }

    setToken(data) {
        sessionStorage.setItem("foosToken", data)
        this.reloadToken()
    }

    clearToken() {
        sessionStorage.removeItem("foosToken")
        this.reloadToken()
    }

    reloadToken() {
        let raw = sessionStorage.getItem("foosToken")
        let parts = raw ? raw.split('.') : null
        let header = parts ? JSON.parse(window.atob(parts[0])) : null
        let payload = parts ? JSON.parse(window.atob(parts[1])) : null
        let username = payload ? payload.username : null
        let admin = payload ? payload.admin : false

        this.setState({
            username: username,
            admin: admin,
        })
    }

    componentDidMount() {
        this.reloadToken()
    }

    render() {
        let auth = {
            username: this.state.username,
            admin: this.state.admin,
            clearToken: this.clearToken,
            setToken: this.setToken,
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
