const HashRouter = ReactRouterDOM.HashRouter
const Link = ReactRouterDOM.Link
const Redirect = ReactRouterDOM.Redirect
const Route = ReactRouterDOM.Route
const Switch = ReactRouterDOM.Switch

const UserContext = React.createContext({})

function modal(body) {
    return (
        <div>
            <div className="modal-fog" />
            <div className="modal-content">
                { body }
            </div>
        </div>
    )
}

const withoutSlash = s => s.endsWith('/') ? s.slice(0, -1) : s

const parentLocation = s => {
    let w = withoutSlash(s)
    let i = w.lastIndexOf('/')
    return i < 1 ? '/' : w.slice(0, i)
}

const gotoParent = component => {
    let history = component.props.history
    let loc = history.location.pathname
    let parent = parentLocation(loc)
    history.push(parent)
}

class PopupLink extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return <Link to={ withoutSlash(this.props.location.pathname) + '/' + this.props.to}>{ this.props.children }</Link>
    }
}
