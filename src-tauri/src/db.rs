use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RecentDocument {
    pub id: i64,
    pub file_path: String,
    pub file_name: String,
    pub doc_type: String, // "hwp", "hwpx", "xlsx", "docx"
    pub file_size: i64,
    pub last_opened_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SessionDraft {
    pub id: i64,
    pub file_path: String,
    pub content: String,
    pub updated_at: String,
}

pub struct AppDb {
    conn: Connection,
}

impl AppDb {
    pub fn new<P: AsRef<Path>>(path: P) -> Result<Self> {
        let conn = Connection::open(path)?;
        let app_db = Self { conn };
        app_db.init_tables()?;
        Ok(app_db)
    }

    pub fn in_memory() -> Result<Self> {
        let conn = Connection::open_in_memory()?;
        let app_db = Self { conn };
        app_db.init_tables()?;
        Ok(app_db)
    }

    fn init_tables(&self) -> Result<()> {
        self.conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS recent_documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_path TEXT NOT NULL UNIQUE,
                file_name TEXT NOT NULL,
                doc_type TEXT NOT NULL,
                file_size INTEGER NOT NULL DEFAULT 0,
                last_opened_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS session_drafts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_path TEXT NOT NULL UNIQUE,
                content TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_recent_docs_opened 
            ON recent_documents(last_opened_at DESC);
            ",
        )?;
        Ok(())
    }

    pub fn record_recent_document(
        &self,
        file_path: &str,
        file_name: &str,
        doc_type: &str,
        file_size: i64,
    ) -> Result<()> {
        self.conn.execute(
            "
            INSERT INTO recent_documents (file_path, file_name, doc_type, file_size, last_opened_at)
            VALUES (?1, ?2, ?3, ?4, CURRENT_TIMESTAMP)
            ON CONFLICT(file_path) DO UPDATE SET
                file_name = excluded.file_name,
                doc_type = excluded.doc_type,
                file_size = excluded.file_size,
                last_opened_at = CURRENT_TIMESTAMP
            ",
            params![file_path, file_name, doc_type, file_size],
        )?;
        Ok(())
    }

    pub fn list_recent_documents(&self, limit: usize) -> Result<Vec<RecentDocument>> {
        let mut stmt = self.conn.prepare(
            "
            SELECT id, file_path, file_name, doc_type, file_size, last_opened_at
            FROM recent_documents
            ORDER BY last_opened_at DESC
            LIMIT ?1
            ",
        )?;

        let rows = stmt.query_map(params![limit as i64], |row| {
            Ok(RecentDocument {
                id: row.get(0)?,
                file_path: row.get(1)?,
                file_name: row.get(2)?,
                doc_type: row.get(3)?,
                file_size: row.get(4)?,
                last_opened_at: row.get(5)?,
            })
        })?;

        let mut results = Vec::new();
        for row in rows {
            results.push(row?);
        }
        Ok(results)
    }

    pub fn save_draft(&self, file_path: &str, content: &str) -> Result<()> {
        self.conn.execute(
            "
            INSERT INTO session_drafts (file_path, content, updated_at)
            VALUES (?1, ?2, CURRENT_TIMESTAMP)
            ON CONFLICT(file_path) DO UPDATE SET
                content = excluded.content,
                updated_at = CURRENT_TIMESTAMP
            ",
            params![file_path, content],
        )?;
        Ok(())
    }

    pub fn load_draft(&self, file_path: &str) -> Result<Option<String>> {
        let mut stmt = self
            .conn
            .prepare("SELECT content FROM session_drafts WHERE file_path = ?1")?;
        let mut rows = stmt.query(params![file_path])?;
        if let Some(row) = rows.next()? {
            let content: String = row.get(0)?;
            Ok(Some(content))
        } else {
            Ok(None)
        }
    }

    pub fn delete_draft(&self, file_path: &str) -> Result<()> {
        self.conn.execute(
            "DELETE FROM session_drafts WHERE file_path = ?1",
            params![file_path],
        )?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_recent_documents_workflow() {
        let db = AppDb::in_memory().expect("in-memory db initialization failed");
        db.record_recent_document("/tmp/sample.hwp", "sample.hwp", "hwp", 1024)
            .expect("record failed");

        let list = db.list_recent_documents(10).expect("list failed");
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].file_name, "sample.hwp");
        assert_eq!(list[0].doc_type, "hwp");
    }

    #[test]
    fn test_session_draft_workflow() {
        let db = AppDb::in_memory().expect("in-memory db initialization failed");
        let path = "/tmp/draft.xlsx";
        let content = "cell A1=100";

        db.save_draft(path, content).expect("save draft failed");
        let loaded = db.load_draft(path).expect("load draft failed");
        assert_eq!(loaded, Some(content.to_string()));

        db.delete_draft(path).expect("delete draft failed");
        let after_delete = db.load_draft(path).expect("load after delete failed");
        assert_eq!(after_delete, None);
    }
}
