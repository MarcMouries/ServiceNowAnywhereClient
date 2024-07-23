// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dotenv::dotenv;
use std::env;
use std::path::Path;

fn load_env() {
    dotenv().ok();

    let mode = if cfg!(debug_assertions) {
        "development"
    } else {
        "production"
    };

    println!("Running in {} mode", mode);

    if mode == "development" {
        println!("Loading .env.test file");
        if Path::new("../.env.test").exists() {
            dotenv::from_filename(".env.test").ok();
        } else {
            println!("Error: .env.test file not found");
        }
    }
}

#[tauri::command]
fn get_env_vars() -> Result<(String, String, String, String, String, String), String> {
    load_env();
    let client_id = env::var("CLIENT_ID").map_err(|e| e.to_string())?;
    let client_secret = env::var("CLIENT_SECRET").map_err(|e| e.to_string())?;
    let redirect_uri = env::var("REDIRECT_URI").map_err(|e| e.to_string())?;
    let servicenow_url = env::var("SERVICENOW_URL").map_err(|e| e.to_string())?;
    let username = env::var("USERNAME").unwrap_or_default();
    let password = env::var("PASSWORD").unwrap_or_default();

    // Print the environment variables to the console
    println!("CLIENT_ID: {}", client_id);
    println!("CLIENT_SECRET: {}", client_secret);
    println!("REDIRECT_URI: {}", redirect_uri);
    println!("SERVICENOW_URL: {}", servicenow_url);
    println!("USERNAME: {}", username);
    println!("PASSWORD: {}", password);

    Ok((
        client_id,
        client_secret,
        redirect_uri,
        servicenow_url,
        username,
        password,
    ))
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! We'll try to log you in next time!", name)
}

fn main() {
    println!("────────────────────────────────────");
    println!(" ");
    // Print the current working directory for debugging purposes
    if let Ok(current_dir) = env::current_dir() {
        println!("Current directory: {:?}", current_dir);
    } else {
        println!("Error: Unable to get current directory");
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_websocket::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, get_env_vars])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
