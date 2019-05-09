const HashRouter = ReactRouterDOM.HashRouter
const Link = ReactRouterDOM.Link
const Redirect = ReactRouterDOM.Redirect
const Route = ReactRouterDOM.Route

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