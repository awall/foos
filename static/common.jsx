const HashRouter = ReactRouterDOM.HashRouter
const Link = ReactRouterDOM.Link
const Redirect = ReactRouterDOM.Redirect
const Route = ReactRouterDOM.Route
const Switch = ReactRouterDOM.Switch

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

const when = (condition, body1, body2) => condition ? body1 : body2
const unless = (condition, body) => condition ? null : body

class When extends React.Component {
    constructor(props) {
        super(props)
    }

    render = () => this.props.value ? this.props.children : null
}

class Unless extends React.Component {
    constructor(props) {
        super(props)
    }

    render = () => this.props.value ? null : this.props.children
}