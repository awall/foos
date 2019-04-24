const Login = () => modal(
    <form>
        Username
        <br />
        <input type="text" name="username" />
        <br />
        <br />
        Password
        <br />
        <input type="password" name="password" />
        <br />
        <br />
        <input type="button" value="Sign In"/>
    </form>
)

const UserMenu = () => (
    <div className="menu">
        <div id="avatar" className="menu-top">???</div>
        <div className="menu-popup">
            <div className="menu-info">signed in as ???</div>
            <Link to="/login"><div className="menu-action">log in</div></Link>
            <div className="menu-action">log out</div>
        </div>
    </div>
)

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
            value : 'WAITING...'
        }
    }

    componentDidMount() {
        axios.get('/hello').then(response =>
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

const App = () => (
    <BrowserRouter>
        <Route path="/" component={Main} />
        <Route path="/login" exact component={Login} />
    </BrowserRouter>
)

ReactDOM.render(
    <App />,
    document.getElementById('root')
)
