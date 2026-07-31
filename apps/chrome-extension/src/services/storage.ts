import type { StoredDocument } from '../types';

const STORAGE_KEYS = {
  TEMP_DOCUMENTS: 'smartfill_temp_customer_docs',
  TEMP_FIELDS: 'smartfill_temp_extracted_fields',
  SESSION_PAID: 'smartfill_session_paid',
};

export interface ExtractedField {
  key: string;
  label: string;
  value: string;
  confidence: number;
  category: string;
}

// Synchronous Fallback (localStorage)
export const getTempCustomerDocsSync = (): StoredDocument[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEMP_DOCUMENTS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveTempCustomerDocsSync = (docs: StoredDocument[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TEMP_DOCUMENTS, JSON.stringify(docs));
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [STORAGE_KEYS.TEMP_DOCUMENTS]: docs });
    }
  } catch (e) {
    console.error('Error saving temp customer docs:', e);
  }
};

// Async Storage API (chrome.storage.local with localStorage fallback)
export const getTempCustomerDocsAsync = async (): Promise<StoredDocument[]> => {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEYS.TEMP_DOCUMENTS], (result: Record<string, any>) => {
        if (result && result[STORAGE_KEYS.TEMP_DOCUMENTS]) {
          resolve(result[STORAGE_KEYS.TEMP_DOCUMENTS]);
        } else {
          resolve(getTempCustomerDocsSync());
        }
      });
    });
  }
  return getTempCustomerDocsSync();
};

export const getTempExtractedFieldsSync = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEMP_FIELDS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

export const saveTempExtractedFieldsSync = (fields: Record<string, string>): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TEMP_FIELDS, JSON.stringify(fields));
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [STORAGE_KEYS.TEMP_FIELDS]: fields });
    }
  } catch (e) {
    console.error('Error saving temp extracted fields:', e);
  }
};

export const getTempExtractedFieldsAsync = async (): Promise<Record<string, string>> => {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEYS.TEMP_FIELDS], (result: Record<string, any>) => {
        if (result && result[STORAGE_KEYS.TEMP_FIELDS]) {
          resolve(result[STORAGE_KEYS.TEMP_FIELDS]);
        } else {
          resolve(getTempExtractedFieldsSync());
        }
      });
    });
  }
  return getTempExtractedFieldsSync();
};

export const isCustomerSessionPaid = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEYS.SESSION_PAID) === 'true';
  } catch (e) {
    return false;
  }
};

export const setCustomerSessionPaid = (paid: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION_PAID, paid ? 'true' : 'false');
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [STORAGE_KEYS.SESSION_PAID]: paid });
    }
  } catch (e) {
    console.error('Error setting session paid state:', e);
  }
};

export const clearTempCustomerSession = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TEMP_DOCUMENTS);
    localStorage.removeItem(STORAGE_KEYS.TEMP_FIELDS);
    localStorage.removeItem(STORAGE_KEYS.SESSION_PAID);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove([
        STORAGE_KEYS.TEMP_DOCUMENTS,
        STORAGE_KEYS.TEMP_FIELDS,
        STORAGE_KEYS.SESSION_PAID,
      ]);
    }
  } catch (e) {
    console.error('Error clearing temp customer session:', e);
  }
};

// Export aliases
export const getTempCustomerDocs = getTempCustomerDocsSync;
export const saveTempCustomerDocs = saveTempCustomerDocsSync;
export const getTempExtractedFields = getTempExtractedFieldsSync;
export const saveTempExtractedFields = saveTempExtractedFieldsSync;

export const loadProfile = (): any => ({});
export const saveProfile = (_profile: any): void => {};
export const loadDocuments = (): StoredDocument[] => getTempCustomerDocsSync();
export const saveDocuments = (docs: StoredDocument[]): void => saveTempCustomerDocsSync(docs);
