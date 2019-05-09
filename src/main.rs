#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use]
extern crate rocket;
extern crate rocket_contrib;
extern crate serde;
extern crate jsonwebtoken;

use rocket::http::Status;
use rocket_contrib::json::Json;
use rocket_contrib::serve::StaticFiles;

use serde::{Serialize, Deserialize};
use jsonwebtoken as jwt;

const SECRET: &str = "oogly_woogly_bugle_boy_from_company_B!";

fn to_jwt(claims: &Claims) -> String {
    jwt::encode(&jwt::Header::default(), claims, SECRET.as_ref()).unwrap()
}

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
struct Claims {
    username: String,
    admin: bool,
}

#[post("/login", data="<credentials>")]
fn login(credentials: Json<Login>) -> Result<String, Status> {
    let Json(login) = credentials;
    let username = login.username;
    let password = login.password;

    if username.eq(&password) {
        let claims = Claims {
            username: username,
            admin: false,
        };
        Result::Ok(to_jwt(&claims))
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
