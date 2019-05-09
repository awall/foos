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
    <UserContext.Consumer>{({username, clearToken}) => {
        if (username) {
            return (
                <div className="menu">
                    <div id="avatar" className="menu-top">{ username }</div>
                    <div className="menu-popup">
                        <div className="menu-info">logged in as { username }</div>
                        <div className="menu-action" onClick={ clearToken }>log out</div>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="menu">
                    <Link to="/login">
                        <div id="avatar" className="menu-top">
                            [click here to log in]
                        </div>
                    </Link>
                </div>
            )
        }
    }}</UserContext.Consumer>
)

const Toolbar = () => (
    <UserContext.Consumer>{({admin}) => (
        <div id="toolbar">
            <div id="bigbar">
                BIG BAR CONTENT HERE
            </div>
            <div id="smallbar">
                { admin ? <ApproveScore /> : null }
                { admin ? <ApproveTeam /> : null }
                <SubmitScore />
                <SubmitTeam />
                <UserMenu />
            </div>
        </div>
    )}</UserContext.Consumer>
)

const Main = () => (
    <div>
        <Toolbar />
        <div id="main">
            <Overview />
        </div>
    </div>
)

class SubmitTeamForm extends React.Component {
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

    render = () => {
        return modal(
            <form onSubmit={ this.submit }>
                Team Name
                <br />
                <input type="text" name="teamname" />
                <br />
                <br />
                Members
                <br />
                <input type="text" name="member1" />
                <br />
                <input type="text" name="member2" />
                <br />
                <br />
                <input type="submit" value="Submit"/>
            </form>
        )
    }
}

const ApproveTeamForm = () => modal(
    <form>
        Team Name
        <br />
        <input type="text" name="teamname" />
        <br />
        <br />
        Member Name1
        <br />
        <input type="text" name="membername1" />
        <br />
        <br />
		Member Name2
        <br />
        <input type="text" name="membername2" />
        <br />
        <br />
        <input type="button" value="Submit"/>
    </form>
)

const ApproveScore = () => (
    <div className="button" id = "ApproveButtonScore">
        <div className="button">Approve Score</div>
    </div>
)

const ApproveTeam = () => (
    <div className="button" id = "ApproveButtonTeam">
        <Link to="/approve-team"><div className="button">Approve Team</div></Link>
    </div>
)

const SubmitScore = () => (
    <div className="button" id = "submitButtonScore">
        <div className="button">Submit Score</div>
    </div>
)

const SubmitTeam = () => (
    <div className="button" id = "submitButtonTeam">
        <Link to="/submit-team"><div className="button">Submit Team</div></Link>
    </div>
)
//
// END pankaj
//

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
                    <Route path="/" component={ Main } />
                    <Route path="/login" exact component={ Login } />
                    <Route path="/submit-team" exact component={ SubmitTeamForm } />
                    <Route path="/approve-team" exact component={ ApproveTeamForm } />
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
