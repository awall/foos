const UserContext = React.createContext({})

class Login extends React.Component {
    static contextType = UserContext

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
        axios
            .post('/api/login', {
                username: this.refs.username.value,
                password: this.refs.password.value,
            })
            .then(response => {
                this.context.setToken(response.data)
                this.setState({
                    failed: false,
                    redirect: true,
                })
            })
            .catch(response => {
                this.context.clearToken()
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
    static contextType = UserContext

    constructor(props) {
        super(props)
        this.logout = this.logout.bind(this)
    }

    logout() {
        this.context.clearToken()
    }

    render() {
        let user = this.context.username

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

const Toolbar = () => (
    <div id="toolbar">
        <div id="bigbar">
            BIG BAR CONTENT HERE
        </div>
        <div id="smallbar">
            <OtherMenu />
            <UserMenu />
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
                <Toolbar />
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
            token: null,
        }

        this.setToken = this.setToken.bind(this)
        this.clearToken = this.clearToken.bind(this)
    }

    setToken(data) {
        sessionStorage.setItem("foosToken", data)
        this.setState({token: data})
    }

    clearToken() {
        sessionStorage.removeItem("foosToken")
        this.setState({token: null})
    }

    componentDidMount() {
        let data = sessionStorage.getItem("foosToken")
        this.setState({token: data})
    }

    render() {
        let raw = this.state.token
        let parts = raw ? raw.split('.') : null
        let header = parts ? JSON.parse(window.atob(parts[0])) : null
        let payload = parts ? JSON.parse(window.atob(parts[1])) : null
        let username = payload ? payload.username : null
        let admin = payload ? payload.admin : false

        return (
            <UserContext.Provider value={{
                username: username,
                admin: admin,
                token: raw,
                setToken: this.setToken,
                clearToken: this.clearToken,
            }}>
                <HashRouter>
                    <Route path="/" component={Main} />
                    <Route path="/login" exact component={Login} />
                </HashRouter>
            </UserContext.Provider>
        )
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
)
