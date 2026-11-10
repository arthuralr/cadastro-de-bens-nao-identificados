import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { WebhookPayload } from '../types';

export interface PendingRecord {
  id: string;
  timestamp: string;
  payload: WebhookPayload;
  previewFotos: string[];
}

interface PatrimonioDB extends DBSchema {
  pending_records: {
    key: string;
    value: PendingRecord;
    indexes: { 'by-timestamp': string };
  };
}

const DB_NAME = 'patrimonio_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'pending_records';

let dbPromise: Promise<IDBPDatabase<PatrimonioDB>> | null = null;

function getDb(): Promise<IDBPDatabase<PatrimonioDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PatrimonioDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by-timestamp', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Salva um novo registro pendente no IndexedDB
 */
export async function savePendingRecord(
  payload: WebhookPayload,
  previewFotos: string[] = []
): Promise<PendingRecord> {
  const db = await getDb();
  const id = `OFF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const record: PendingRecord = {
    id,
    timestamp: new Date().toISOString(),
    payload,
    previewFotos,
  };

  await db.put(STORE_NAME, record);
  return record;
}

/**
 * Recupera todos os registros pendentes ordenados do mais antigo ao mais recente
 */
export async function getPendingRecords(): Promise<PendingRecord[]> {
  try {
    const db = await getDb();
    const records = await db.getAll(STORE_NAME);
    // Ordena do mais antigo para o mais recente para respeitar ordem de coleta
    return records.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  } catch (error) {
    console.error('Erro ao ler registros pendentes do IndexedDB:', error);
    return [];
  }
}

/**
 * Retorna a quantidade total de registros pendentes
 */
export async function getPendingCount(): Promise<number> {
  try {
    const db = await getDb();
    return await db.count(STORE_NAME);
  } catch (error) {
    console.error('Erro ao contar registros pendentes:', error);
    return 0;
  }
}

/**
 * Remove um registro pendente pelo ID após sincronização com sucesso
 */
export async function removePendingRecord(id: string): Promise<void> {
  try {
    const db = await getDb();
    await db.delete(STORE_NAME, id);
  } catch (error) {
    console.error(`Erro ao remover registro ${id} do IndexedDB:`, error);
    throw error;
  }
}

/**
 * Limpa todos os registros pendentes do IndexedDB
 */
export async function clearAllPendingRecords(): Promise<void> {
  try {
    const db = await getDb();
    await db.clear(STORE_NAME);
  } catch (error) {
    console.error('Erro ao limpar registros pendentes:', error);
  }
}
