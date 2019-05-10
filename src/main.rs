#![feature(proc_macro_hygiene, decl_macro)]
#![feature(type_alias_enum_variants)]



#[macro_use]
extern crate rocket;
extern crate rocket_contrib;
extern crate serde;
extern crate jsonwebtoken;
extern crate uuid;

use std::sync::RwLock;
use std::time::SystemTime;

use rocket::State;
use rocket::http::Status;
use rocket::request::{Outcome, FromRequest, Request};
use rocket_contrib::json::Json;
use rocket_contrib::serve::StaticFiles;
use rocket_contrib::uuid::Uuid;

use serde::{Serialize, Deserialize};
use jsonwebtoken as jwt;

const SECRET: &str = "oogly_woogly_bugle_boy_from_company_B!";

#[derive(Deserialize, Debug)]
struct Login {
    username: String,
    password: String,
}

#[derive(Deserialize, Serialize, Debug)]
struct Claims {
    exp: u64,
    iat: u64,

    username: String,
    admin: bool,
}

#[derive(Deserialize, Serialize, Debug)]
struct Admin { }

#[derive(Deserialize, Serialize, Debug)]
struct TeamSubmission {
    name: String,
    members: Vec<String>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
struct TeamSubmissionRecord {
    id: uuid::Uuid,
    author: String,
    name: String,
    members: Vec<String>,
}

struct TeamSubmissionRecords(RwLock<Vec<TeamSubmissionRecord>>);

#[derive(Deserialize, Serialize, Debug)]
struct Team {
    name: String,
    members: Vec<String>,
    slot: i32,
}

fn interpret_auth_header(header: String) -> Option<Claims> {
    let words: Vec<String> = header.split_whitespace().map(String::from).collect();

    match words.len() {
        2 => {
            if words[0] == "Bearer" {
                from_jwt(&words[1]).ok()
            } else {
                Option::None
            }
        },
        _ => Option::None,
    }
}

impl<'a, 'r> FromRequest<'a, 'r> for Claims {
    type Error = &'static str;

    fn from_request(request: &'a Request<'r>) -> Outcome<Self, Self::Error> {
        let keys: Vec<_> = request.headers().get("Authorization").collect();
        match keys.len() {
            1 => {
                match interpret_auth_header(keys[0].to_string()) {
                    Some(claims) => Outcome::Success(claims),
                    None => Outcome::Failure((Status::Unauthorized, "invalid token")),
                }
            },
            0 => Outcome::Failure((Status::Unauthorized, "missing authorization header")),
            _ => Outcome::Failure((Status::Unauthorized, "too many authorization headers")),
        }
    }
}

impl<'a, 'r> FromRequest<'a, 'r> for Admin {
    type Error = &'static str;

    fn from_request(request: &'a Request<'r>) -> Outcome<Admin, Self::Error> {
        let claims = request.guard::<Claims>()?;

        if claims.admin {
            Outcome::Success(Admin { })
        } else {
            Outcome::Failure((Status::Forbidden, "you are not an administrator"))
        }
    }
}

fn to_jwt(claims: &Claims) -> String {
    jwt::encode(&jwt::Header::default(), claims, SECRET.as_ref()).unwrap()
}

fn from_jwt(raw: &str) -> Result<Claims, jwt::errors::Error> {
    // note: the decode automatically checks for expiry
    let token_data = jwt::decode::<Claims>(raw, SECRET.as_ref(), &jwt::Validation::default()) ?;
    Result::Ok(token_data.claims)
}

#[post("/submit-team", data="<json>")]
fn submit_team(json: Json<TeamSubmission>, claims: Claims, records: State<TeamSubmissionRecords>) -> Status {
    let Json(submission) = json;
    let record = TeamSubmissionRecord {
        id: uuid::Uuid::new_v4(),
        author: claims.username,
        name: submission.name.clone(),
        members: submission.members.clone(),
    };
    match records.0.write().ok() {
        Some(mut r) => {
            r.push(record);
            Status::Ok
        },
        None => Status::InternalServerError,
    }
}

#[post("/reject-submission/<id>")]
fn reject_submission(id: Uuid, _admin: Admin, records: State<TeamSubmissionRecords>) {
    match records.0.write().ok() {
        Some(mut r) => {
            r.retain(|value| value.id != *id)
        },
        None => (),
    }
}

#[get("/team-submissions")]
fn team_submissions(records: State<TeamSubmissionRecords>) -> Result<Json<Vec<TeamSubmissionRecord>>, Status> {
    // TODO: think about this some more... why should I have to clone the list just to make a JSON copy of it again?
    match records.0.read() {
        Ok(r) => Result::Ok(Json(r.clone())),
        _ => Result::Err(Status::InternalServerError)
    }
}

#[post("/login", data="<json>")]
fn login(json: Json<Login>) -> Result<String, Status> {
    let Json(login) = json;
    let username = login.username;
    let password = login.password;

    let iat = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap().as_secs();
    let exp = iat + 360000;

    if username == password {
        let admin = "admin" == &username;
        let claims = Claims {
            iat: iat,
            exp: exp,

            username: username,
            admin: admin,
        };
        Result::Ok(to_jwt(&claims))
    } else {
        Result::Err(Status::Unauthorized)
    }
}

fn main() {
    let empty: Vec<TeamSubmissionRecord> = vec!();
    let records = TeamSubmissionRecords(RwLock::new(empty));
    rocket::ignite()
        .mount("/api", routes![login, submit_team, reject_submission, team_submissions])
        .mount("/", StaticFiles::from("static"))
        .manage(records)
        .launch();
}
