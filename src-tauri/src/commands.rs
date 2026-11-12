use crate::db::{AppDb, RecentDocument};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use std::sync::Mutex;
use tauri::State;

pub struct AppState {
    pub db: Mutex<AppDb>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DocumentData {
    pub file_path: String,
    pub file_name: String,
    pub doc_type: String, // "hwp", "hwpx", "xlsx", "docx", "unknown"
    pub size: u64,
    pub base64_content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppInfo {
    pub name: String,
    pub version: String,
    pub rhwp_enabled: bool,
    pub genoffice_enabled: bool,
}

fn detect_doc_type(path: &Path) -> String {
    match path
        .extension()
        .and_then(|ext| ext.to_str())
        .map(|s| s.to_lowercase())
    {
        Some(ext) if ext == "hwp" => "hwp".to_string(),
        Some(ext) if ext == "hwpx" => "hwpx".to_string(),
        Some(ext) if ext == "xlsx" => "xlsx".to_string(),
        Some(ext) if ext == "docx" => "docx".to_string(),
        _ => "unknown".to_string(),
    }
}

#[tauri::command]
pub fn open_document(state: State<AppState>, path: String) -> Result<DocumentData, String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err(format!("파일이 존재하지 않습니다: {}", path));
    }

    let file_name = p
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("document")
        .to_string();

    let doc_type = detect_doc_type(p);
    let metadata = fs::metadata(p).map_err(|e| e.to_string())?;
    let bytes = fs::read(p).map_err(|e| e.to_string())?;
    let base64_content = base64_simd_encode(&bytes);

    // SQLite 최근 목록 갱신
    if let Ok(db) = state.db.lock() {
        let _ = db.record_recent_document(&path, &file_name, &doc_type, metadata.len() as i64);
    }

    Ok(DocumentData {
        file_path: path,
        file_name,
        doc_type,
        size: metadata.len(),
        base64_content,
    })
}

#[tauri::command]
pub fn save_document(
    state: State<AppState>,
    path: String,
    base64_content: String,
) -> Result<(), String> {
    let p = Path::new(&path);
    let bytes = base64_simd_decode(&base64_content)?;

    fs::write(p, &bytes).map_err(|e| format!("파일 저장 실패: {}", e))?;

    // 임시저장 캐시 제거 (정상 저장되었으므로)
    if let Ok(db) = state.db.lock() {
        let _ = db.delete_draft(&path);
    }

    Ok(())
}

#[tauri::command]
pub fn get_recent_documents(
    state: State<AppState>,
    limit: Option<usize>,
) -> Result<Vec<RecentDocument>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.list_recent_documents(limit.unwrap_or(20))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_session_draft(
    state: State<AppState>,
    file_path: String,
    content: String,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.save_draft(&file_path, &content)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn load_session_draft(
    state: State<AppState>,
    file_path: String,
) -> Result<Option<String>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.load_draft(&file_path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_app_info() -> AppInfo {
    AppInfo {
        name: "Omni Office".to_string(),
        version: "0.1.0".to_string(),
        rhwp_enabled: true,
        genoffice_enabled: true,
    }
}

// 심플한 표준 base64 인코더 / 디코더 (외부 crate 의존성 최소화)
const BASE64_ALPHABET: &[u8; 64] =
    b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

fn base64_simd_encode(data: &[u8]) -> String {
    let mut result = String::with_capacity((data.len() + 2) / 3 * 4);
    for chunk in data.chunks(3) {
        let b0 = chunk[0];
        let b1 = if chunk.len() > 1 { chunk[1] } else { 0 };
        let b2 = if chunk.len() > 2 { chunk[2] } else { 0 };

        result.push(BASE64_ALPHABET[(b0 >> 2) as usize] as char);
        result.push(BASE64_ALPHABET[(((b0 & 0x03) << 4) | (b1 >> 4)) as usize] as char);

        if chunk.len() > 1 {
            result.push(BASE64_ALPHABET[(((b1 & 0x0f) << 2) | (b2 >> 6)) as usize] as char);
        } else {
            result.push('=');
        }

        if chunk.len() > 2 {
            result.push(BASE64_ALPHABET[(b2 & 0x3f) as usize] as char);
        } else {
            result.push('=');
        }
    }
    result
}

fn base64_simd_decode(input: &str) -> Result<Vec<u8>, String> {
    let mut table = [0xFFu8; 256];
    for (i, &b) in BASE64_ALPHABET.iter().enumerate() {
        table[b as usize] = i as u8;
    }

    let clean = input.trim_end_matches('=');
    let mut bytes = Vec::new();
    let chars: Vec<char> = clean.chars().collect();

    for chunk in chars.chunks(4) {
        let mut buf = [0u8; 4];
        for (i, &c) in chunk.iter().enumerate() {
            let val = table[c as usize];
            if val == 0xFF {
                return Err("잘못된 Base64 문자".to_string());
            }
            buf[i] = val;
        }

        bytes.push((buf[0] << 2) | (buf[1] >> 4));
        if chunk.len() > 2 {
            bytes.push((buf[1] << 4) | (buf[2] >> 2));
        }
        if chunk.len() > 3 {
            bytes.push((buf[2] << 6) | buf[3]);
        }
    }
    Ok(bytes)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_base64_encode_decode() {
        let sample = b"Hello, Omni Office! \xec\x95\x88\xeb\x85\x95 \xed\x95\x9c\xea\xb8\x80";
        let encoded = base64_simd_encode(sample);
        let decoded = base64_simd_decode(&encoded).expect("decode failed");
        assert_eq!(sample.to_vec(), decoded);
    }

    #[test]
    fn test_detect_doc_type() {
        assert_eq!(detect_doc_type(Path::new("doc.hwp")), "hwp");
        assert_eq!(detect_doc_type(Path::new("doc.HwPx")), "hwpx");
        assert_eq!(detect_doc_type(Path::new("calc.xlsx")), "xlsx");
        assert_eq!(detect_doc_type(Path::new("word.docx")), "docx");
        assert_eq!(detect_doc_type(Path::new("note.txt")), "unknown");
    }
}
