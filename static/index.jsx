const UserContext = React.createContext({})

const Fail = ({error}) => modal(
    <UserContext.Consumer>
        {({clearError}) => (
            <form onSubmit={ e => { e.preventDefault(); clearError(); }}>
                <br />
                <div class="error">{ error }</div>
                <br />
                <br />
                <input type="submit" value="Ok" />
            </form>
        )}
    </UserContext.Consumer>
)


class Login extends React.Component {
    static contextType = UserContext

    constructor(props) {
        super(props)
        this.state = {
            redirect: false,
            failed: false,
        }
    }

    login = event => {
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

    render = () => {
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

class OtherMenu extends React.Component {
    static contextType = UserContext

    constructor(props) {
        super(props)
    }

    test = () => this.context.post(
        '/api/needsadmin',
        {},
        response => alert('success' + response)
    )

    render = () => (
        <div className="menu">
            <div className="menu-top">Random Stuff</div>
            <div className="menu-popup">
                <div className="menu-info">Some info</div>
                <div className="menu-action" onClick={ this.test }>Requires Auth or FAIL!</div>
                <div className="menu-action">Some action #2</div>
            </div>
        </div>
    )
}


const UserMenu = () => (
    <UserContext.Consumer>{({username, clearToken}) => (
        <div className="menu">
            <div id="avatar" className="menu-top">
                { username == null ? '[not logged in]' : username }
            </div>
            <div className="menu-popup">
                { username == null ? null : <div className="menu-info">logged in as { username }</div> }
                { username == null
                    ? <Link to="/login"><div className="menu-action">log in</div></Link>
                    : <div className="menu-action" onClick={ clearToken }>log out</div> }
            </div>
        </div>
    )}</UserContext.Consumer>
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

const Main = () => (
    <div>
        <Toolbar />
        <div id="main">
            "Hello, world!
        </div>
    </div>
)

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            token: null,
            error: null,
        }
    }

    setToken = data => {
        sessionStorage.setItem("foosToken", data)
        this.setState({token: data})
    }

    clearToken = () => {
        sessionStorage.removeItem("foosToken")
        this.setState({token: null})
    }

    componentDidMount = () => {
        let data = sessionStorage.getItem("foosToken")
        this.setState({token: data})
    }

    post = (url, data, success) => {
        let token = this.state.token
        let headers = {}
        if (token) {
            headers = { 'Authorization': 'Bearer ' + token }
        }

        axios({
            method: 'post',
            url: url,
            headers: headers,
            data: data,
          })
        .then(success)
        .catch(response => this.setState({
            error: response.toString()
        }))
    }

    clearError = () => this.setState({error: null})

    render = () => {
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
                post: this.post,
                clearError: this.clearError,
            }}>
                <HashRouter>
                    <Route path="/" component={ Main } />
                    <Route path="/login" exact component={ Login } />
                </HashRouter>
                { this.state.error ? <Fail error={ this.state.error } /> : null }
            </UserContext.Provider>
        )
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
)
