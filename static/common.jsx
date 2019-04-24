const BrowserRouter = ReactRouterDOM.BrowserRouter
const Route = ReactRouterDOM.Route
const Link = ReactRouterDOM.Link

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