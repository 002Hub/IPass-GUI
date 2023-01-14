#![cfg_attr(
	all(not(debug_assertions), target_os = "linux"),
	windows_subsystem = "windows"
)]

extern crate ip_lib;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

#[tauri::command]
fn get_version() -> String {
	return option_env!("CARGO_PKG_VERSION").unwrap_or("x.x.x").to_string();
}

#[tauri::command]
fn create_entry(name: String, username: String, pw: &str, mpw: String) -> bool {
	ip_lib::create_entry(&name, username+";"+pw, mpw)
}

#[tauri::command]
fn random_password() -> String {
	ip_lib::random_password()
}

#[tauri::command]
fn get_entry(name: String, mpw: String) -> Result<(String,String),String> {
	let binding = ip_lib::get_entry(&name, mpw);
	if let Ok(data) = binding {
		let mut split = data.split(";");
		return Ok((split.next().unwrap().to_string(),split.next().unwrap().to_string()));
	} else {
		return Err(binding.expect_err("expected error"));
	}
}

#[tauri::command]
fn get_entries() -> Vec<String> {
	let mut vector: Vec<String> = Vec::default();
	for entry in ip_lib::get_entries() {
		let entry_filename = entry.unwrap().file_name();
		let ent =entry_filename.to_str().unwrap();
		vector.insert(0, ent[..ent.len()-6].to_string());
	}

	vector.sort();

	return vector;
}

#[tauri::command]
fn remove_entry(name: &str) -> bool {
	let filepath = &(ip_lib::get_ipass_folder()+name+".ipass");
	if std::path::Path::new(filepath).exists() {
		std::fs::remove_file(filepath).unwrap();
		return true;
	}
	return false;
}

fn main() {
	tauri::Builder::default()
		.invoke_handler(tauri::generate_handler![get_version,create_entry,random_password,get_entry,get_entries,remove_entry])
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
