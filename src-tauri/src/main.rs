#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::fs::File;
use std::io::Write;
use tokio::runtime::Runtime;

extern crate ip_lib;
extern crate rand;
extern crate open;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

#[tauri::command]
fn get_version() -> String {
	option_env!("CARGO_PKG_VERSION").unwrap_or("x.x.x").to_string()
}

#[tauri::command]
fn create_entry(name: String, username: String, pw: &str, mpw: String) -> bool {
	let return_value = ip_lib::create_entry(&name, username+";"+pw, mpw);
	if return_value {
		isync_save();
	}
	return_value
}

#[tauri::command]
fn random_password() -> String {
	ip_lib::random_password()
}

#[tauri::command]
fn get_entry(name: String, mpw: String) -> Result<(String,String),String> {
	let binding = ip_lib::get_entry(&name, mpw);
	if let Ok(data) = binding {
		let mut split = data.split(';');
		Ok((split.next().unwrap().to_string(),split.next().unwrap().to_string()))
	} else {
		Err(binding.expect_err("expected error"))
	}
}

#[tauri::command]
fn get_entries() -> Vec<String> {
	let mut vector: Vec<String> = Vec::default();
	for entry in ip_lib::get_entries() {
		let entry_filename = entry.unwrap().file_name();
		let ent = entry_filename.to_str().unwrap();
		if ent != "token.ipasst" {
			vector.insert(0, ent[..ent.len()-6].to_string());
		}
	}

	vector.sort();

	vector
}

#[tauri::command]
fn remove_entry(name: &str) -> bool {
	let filepath = &(ip_lib::get_ipass_folder()+name+".ipass");
	if std::path::Path::new(filepath).exists() {
		std::fs::remove_file(filepath).unwrap();
		isync_save();
		return true;
	}
	false
}

#[tauri::command]
fn open_authorize() -> u32 {
	let code:u32 = rand::random();
    open::that(format!("https://ipost.rocks/authorize?id=1&extra={}",code)).unwrap();
	code
}

#[tauri::command]
fn store_token(token: String) {
	let filepath = &(ip_lib::get_ipass_folder()+"token.ipasst");
	let mut file = File::create(filepath).unwrap();
    file.write_all(token.as_bytes()).unwrap();
}

#[tauri::command]
fn get_isync_status() -> bool {
	let filepath = &(ip_lib::get_ipass_folder()+"token.ipasst");
	std::path::Path::new(filepath).exists()
}

fn isync_save() {
	let isync_save_future = ip_lib::isync_save();

	let rt = Runtime::new().unwrap();
	let _save_output = rt.block_on(isync_save_future);
	//println!("isync_save: {}",save_output);
}

#[tauri::command]
fn sync_isync() {
	let rt = Runtime::new().unwrap();

	let isync_get_future = ip_lib::isync_get();

	//println!("going to block on isync_get");
	let _get_output = rt.block_on(isync_get_future);
	//println!("isync_get: {}",get_output);
}

fn main() {
	sync_isync();

	tauri::Builder::default()
		.invoke_handler(tauri::generate_handler![
			get_version,create_entry,random_password,
			get_entry,get_entries,remove_entry,
			open_authorize,store_token,get_isync_status,
			sync_isync])
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
