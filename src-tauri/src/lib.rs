pub mod commands;
pub mod db;

use commands::AppState;
use db::AppDb;
use std::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db = match AppDb::new("omni_office.db") {
        Ok(db) => db,
        Err(_) => AppDb::in_memory().expect("SQLite in-memory fallback failed"),
    };

    let app_state = AppState { db: Mutex::new(db) };

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            commands::open_document,
            commands::save_document,
            commands::get_recent_documents,
            commands::save_session_draft,
            commands::load_session_draft,
            commands::get_app_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running omni-office application");
}
