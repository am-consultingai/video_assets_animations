import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { ProjectState } from "../types";

const DB_NAME = "motion-graphics-generator";
const DB_VERSION = 1;
const STORE = "project";

interface MGSchema extends DBSchema {
  [STORE]: {
    key: string;
    value: ProjectState;
  };
}

let dbPromise: Promise<IDBPDatabase<MGSchema>> | null = null;

function getDb(): Promise<IDBPDatabase<MGSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<MGSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      },
    });
  }
  return dbPromise;
}

const CURRENT_KEY = "current";

export async function loadProject(): Promise<ProjectState | undefined> {
  const db = await getDb();
  return db.get(STORE, CURRENT_KEY);
}

export async function saveProject(project: ProjectState): Promise<void> {
  const db = await getDb();
  await db.put(STORE, project, CURRENT_KEY);
}

export async function clearProject(): Promise<void> {
  const db = await getDb();
  await db.delete(STORE, CURRENT_KEY);
}
