Foos! Running on rocket + react + axios.

# Dependencies
1. Install the latest version of [Rust + Cargo](https://www.rust-lang.org/tools/install).
2. Clone this git repo.

# Run the server

     cargo build

The first time may take several minutes, it must download and install all dependencies.

     cargo run

This will run the rocket web server on **http://localhost:8000**. If you change the rust code, you will have to restart the server.
If you're only changing the .html / .jsx code, your changes will be detected automatically and all you need to do is refresh
your browser.