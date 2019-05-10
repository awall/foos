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
                this.props.history.push('/')
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
                <Link to="/login">
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
                <div className="menu">
                    <Link to="/overview"><div className="menu-top">Standings</div></Link>
                </div>
                <When value={admin}>
                    <div className="menu">
                        <Link to="/assign-team"><div className="menu-top">Assign Teams</div></Link>
                    </div>
                </When>
                <When value={username}>
                    <div className="menu">
                        <Link to="/submit-team"><div className="menu-top">Submit Team</div></Link>
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
        this.context
            .post('/api/submit-team', {
                name: this.refs.team.value,
                members: [ this.refs.member1.value, this.refs.member2.value],
            }, response => {
                this.props.history.push('/')
            })
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

class AssignSubmission extends React.Component {
    static contextType = UserContext

    constructor(props) {
        super(props)
    }

    reject = () => {
        this.props.reject(this.props.value)
    }

    render = () => {
        let value = this.props.value
        let members = []
        for (let index in value.members) {
            let member = value.members[index]
            members.push(<div className="member">{ member }</div>)
        }

        return (
            <div className="submission">
                <input className="reject" type="button" value="Reject" onClick={ this.reject }/>
                <div className="team-name">{ value.name }</div>
                <div className="members">
                    { members }
                </div>
                <div className="submitted-by"><br /><br />submitted by { value.author }</div>
            </div>
        )
    }
}

class AssignTeam extends React.Component {
    static contextType = UserContext

    constructor(props) {
        super(props)
        this.state = { json: [ ], rejected: [] }
    }

    reject = submission => {
        this.context
            .post('/api/reject-submission/' + submission.id, {},
            response => {
                let rejected = this.state.rejected
                rejected.push(submission.id)
                this.setState({rejected: rejected})
            })
    }

    componentDidMount = () => {
        this.context.get(
            '/api/team-submissions',
            response => this.setState({json: response.data }))
    }

    render = () => {
        let elements = []
        for (let index in this.state.json) {
            let submission = this.state.json[index]
            if (!this.state.rejected.includes(submission.id, 0)) {
                elements.push(<AssignSubmission value={ submission } reject={ this.reject } />)
            }
        }

        return (
            <div>{ elements }</div>
        )
    }
}

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

    get = (url, handleSuccess) => {
        let token = this.state.token
        let headers = {}
        if (token) {
            headers = { 'Authorization': 'Bearer ' + token }
        }

        axios({
            method: 'get',
            url: url,
            headers: headers,
          })
        .then(handleSuccess)
        .catch(error => {
            let logError = (msg) => this.setState({ error: msg.toString() })
            logError(error.response.status + " " + error.response.statusText);
        })
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
                get: this.get,
                clearError: this.clearError,
            }}>
                <HashRouter>
                    <div>
                        <Toolbar />
                        <div id="main">
                            <Switch>
                                <Route exact path="/assign-team" component={ AssignTeam } />
                                <Route exact path="/overview" component={ Overview } />
                            </Switch>
                        </div>
                    </div>

                    <Route exact path="/login" component={ Login } />
                    <Route exact path="/submit-team" component={ SubmitTeam } />
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
