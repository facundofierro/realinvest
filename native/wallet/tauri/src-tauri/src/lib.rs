#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  use tauri::Manager;
  #[cfg(any(target_os = "linux", windows))]
  use tauri_plugin_deep_link::DeepLinkExt;
  tauri::Builder::default()
    .plugin(tauri_plugin_deep_link::init())
    .plugin(tauri_plugin_opener::init())
    .setup(|app| {
      let salt_path = app.path().app_local_data_dir()?.join("stronghold-salt");
      app.handle().plugin(tauri_plugin_stronghold::Builder::with_argon2(&salt_path).build())?;
      #[cfg(any(target_os = "linux", windows))]
      app.deep_link().register_all()?;
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
