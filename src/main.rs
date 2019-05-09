#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use]
extern crate rocket;
extern crate rocket_contrib;
extern crate serde;

use rocket::http::Status;
use rocket_contrib::json::Json;
use rocket_contrib::serve::StaticFiles;

use serde::{Serialize, Deserialize};

#[get("/hello")]
fn hello() -> &'static str {
    "Hello, world!"
}

#[derive(Deserialize, Debug)]
struct Login {
    username: String,
    password: String,
}

#[derive(Serialize, Debug)]
struct AuthToken {
    username: String,
    roles: Vec<String>,
}

#[post("/login", data="<credentials>")]
fn login(credentials: Json<Login>) -> Result<Json<AuthToken>, Status> {
    let Json(login) = credentials;
    let username = login.username;
    let password = login.password;

    if username.eq(&password) {
        let token = AuthToken {
            username: username,
            roles: vec!(),
        };
        Result::Ok(Json(token))
    } else {
        Result::Err(Status::Unauthorized)
    }
}

fn main() {
    rocket::ignite()
        .mount("/api", routes![hello, login])
        .mount("/", StaticFiles::from("static"))
        .launch();
}
