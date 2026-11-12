export type DocType = 'hwp' | 'xlsx' | 'docx' | 'md';

export interface DocumentTab {
  id: string;
  title: string;
  docType: DocType;
  filePath?: string;
  isModified: boolean;
  content?: string;
}

export type MenuTabId = 'file' | 'edit' | 'view' | 'insert' | 'format' | 'page' | 'table' | 'tools';
