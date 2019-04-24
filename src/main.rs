#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use]
extern crate rocket;
extern crate rocket_contrib;

use rocket_contrib::serve::StaticFiles;

#[get("/hello")]
fn hello() -> &'static str {
    "Hello, world!"
}

fn main() {
    rocket::ignite()
        .mount("/", StaticFiles::from("static"))
        .mount("/", routes![hello])
        .launch();
}
