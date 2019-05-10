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
        this.state = { failed: false }
    }

    login = event => {
        // we need this to stop the default behaviour, which is posting to "/" using the username and password as query parameters
        event.preventDefault()
        this.context
            .post('/api/login', {
                username: this.refs.username.value,
                password: this.refs.password.value,
            }, response => {
                this.context.setToken(response.data)
                this.props.history.goBack()
            }, (error, logError) => {
                if (error.response.status == 401) {
                    this.setState({ failed: true })
                } else {
                    logError(error.response.status + " " + error.response.statusText)
                }
            })
    }

    render = () => {
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

const UserMenu = () => (
    <UserContext.Consumer>{({username, clearToken}) => (
        <div className="menu">
            <When value={username}>
                <div id="avatar" className="menu-top">{ username }</div>
                <div className="menu-popup">
                    <div className="menu-info">logged in as { username }</div>
                    <div className="menu-action" onClick={ clearToken }>log out</div>
                </div>
            </When>
            <Unless value={username}>
                <Link to="login/">
                    <div id="avatar" className="menu-top">
                        [click here to log in]
                    </div>
                </Link>
            </Unless>
        </div>
    )}</UserContext.Consumer>
)

const Toolbar = () => (
    <UserContext.Consumer>{({username, admin}) => (
        <div id="toolbar">
            <div id="bigbar">
                <img src="aucerna.png" />
            </div>
            <div id="smallbar">
                <When value={admin}>
                    <div className="menu">
                        <Link to="/assign-team/"><div className="menu-top">Assign Teams</div></Link>
                    </div>
                </When>
                <When value={username}>
                    <div className="menu">
                        <Link to="submit-team/"><div className="menu-top">Submit Team</div></Link>
                    </div>
                </When>
                <UserMenu />
            </div>
        </div>
    )}</UserContext.Consumer>
)

class SubmitTeam extends React.Component {
    static contextType = UserContext

    submit = event => {
        // we need this to stop the default behaviour, which is posting to "/" using the username and password as query parameters
        event.preventDefault()
        this.props.history.goBack()
        /* this.context
            .post('/api/login', {
                username: this.refs.username.value,
                password: this.refs.password.value,
            }, response => {
                this.context.setToken(response.data)
                this.props.history.push('/')
            }, (error, logError) => {
                if (error.response.status == 401) {
                    this.setState({ failed: true })
                } else {
                    logError(error.response.status + " " + error.response.statusText)
                }
            })
            */
    }

    componentDidMount = () => {
        if (!this.context.admin) {
            this.refs.member1.value = this.context.username
            this.refs.team.value = this.context.username + "'s team"
            this.refs.member1.disabled = true
        }
    }

    render = () => modal( 
        <form onSubmit={ this.submit }>
            Team
            <br />
            <input type="text" name="team" ref="team"/>
            <br />
            <br />
            Members
            <br />
            <input type="text" name="member1" ref="member1" />
            <br />
            <input type="text" name="member2" ref="member2" />
            <br />
            <br />
            <input type="submit" value="Submit" />
        </form>
    )
}

const AssignTeam = () => (
    <div>
        ASSIGN TO ME HERE!!!!
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

    post = (url, data, handleSuccess, handleError) => {
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
        .then(handleSuccess)
        .catch(error => {
            let logError = (msg) => this.setState({ error: msg.toString() })
            if (handleError) {
                handleError(error, logError)
            } else {
                logError(error.response.status + " " + error.response.statusText);
            }
        })
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
                    <div>
                        <Toolbar />                                
                        <div id="main">
                            <Switch>
                                <Route path="/assign-team/" component={ AssignTeam } />
                                <Route path="/" component={ Overview } />
                            </Switch>
                        </div>
                    </div>

                    <Route path="*/login/" component={ Login } />
                    <Route path="*/submit-team/" component={ SubmitTeam } />
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
