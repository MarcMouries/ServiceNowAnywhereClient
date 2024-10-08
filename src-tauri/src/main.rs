// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dotenv::dotenv;
use std::env;
use std::path::Path;
use tauri::Manager;
use tauri_plugin_decorum::WebviewWindowExt; // adds helper methods to WebviewWindow

//use tauri::{TitleBarStyle, WebviewUrl, WebviewWindowBuilder};

mod date_util;

fn load_env() -> String {
    dotenv().ok();

    let running_mode = if cfg!(debug_assertions) {
        "Development"
    } else {
        "Production"
    };
    if running_mode == "Development" {
        println!("Loading .env.test file");
        if Path::new("../.env.test").exists() {
            dotenv::from_filename(".env.test").ok();
        } else {
            println!("Error: .env.test file not found");
        }
    }
    running_mode.to_string()
}

#[tauri::command]
fn initialize_app() -> Result<(String, String, String, String), String> {
    let running_mode = load_env();
    //let client_id = env::var("CLIENT_ID").map_err(|e| e.to_string())?;
    //let client_secret = env::var("CLIENT_SECRET").map_err(|e| e.to_string())?;
    let redirect_uri = env::var("REDIRECT_URI").map_err(|e| e.to_string())?;
    let service_now_url = env::var("SERVICENOW_URL").map_err(|e| e.to_string())?;
    let username = env::var("USERNAME").unwrap_or_default();
    let password = env::var("PASSWORD").unwrap_or_default();

    println!(" ");
    println!("────────────────────────────────────────────────────────────────────────");
    const LABEL_WIDTH: usize = 16;
    println!("{:<LABEL_WIDTH$}{}", "App Name:", "ServiceNow Anywhere");
    println!(
        "{:<LABEL_WIDTH$}{}",
        "Started on:",
        date_util::get_formatted_date_time()
    );
    println!("{:<LABEL_WIDTH$}{}", "Running mode:", running_mode);

    //println!("{:<LABEL_WIDTH$}{}", "CLIENT_ID:", client_id);
    //println!("{:<LABEL_WIDTH$}{}", "CLIENT_SECRET:", client_secret);
    println!("{:<LABEL_WIDTH$}{}", "REDIRECT_URI:", redirect_uri);
    println!("{:<LABEL_WIDTH$}{}", "SERVICENOW_URL:", service_now_url);
    println!("{:<LABEL_WIDTH$}{}", "USERNAME:", username);
    println!("{:<LABEL_WIDTH$}{}", "PASSWORD:", password);
    // Print the current working directory for debugging purposes
    if let Ok(current_dir) = env::current_dir() {
        println!("{:<LABEL_WIDTH$}{:?}", "Current dir:", current_dir);
    } else {
        println!("Error: Unable to get current directory");
    }
    println!("────────────────────────────────────────────────────────────────────────");

    Ok((
        redirect_uri,
        service_now_url,
        username,
        password,
    ))
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! We'll try to log you in next time!", name)
}

/*
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, initialize_app])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
*/

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_decorum::init()) // initialize the decorum plugin
        .plugin(tauri_plugin_shell::init())

		.setup(|app| {
			// Create a custom titlebar for main window
			// On Windows this hides decoration and creates custom window controls
			// On macOS it needs hiddenTitle: true and titleBarStyle: overlay
			let main_window = app.get_webview_window("main").unwrap();
			main_window.create_overlay_titlebar().unwrap();

			// Some macOS-specific helpers
			#[cfg(target_os = "macos")] {
				// Set a custom inset to the traffic lights
				main_window.set_traffic_lights_inset(12.0, 16.0).unwrap();

				// Make window transparent without privateApi
                main_window.make_transparent().unwrap();

				// Set window level
				// NSWindowLevel: https://developer.apple.com/documentation/appkit/nswindowlevel
                //main_window.set_window_level(25).unwrap();
			}

			Ok(())
		})
        .invoke_handler(tauri::generate_handler![greet, initialize_app])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
