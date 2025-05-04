import sqlite3 from 'sqlite3';
import path from 'path';
import { promisify } from 'util';

const dbFile = path.resolve(process.cwd(), 'news.db');

function openDb() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbFile, (err) => {
      if (err) {
        console.error('Database opening error:', err);
        return reject(err);
      }
      db.run(
        `CREATE TABLE IF NOT EXISTS noticias (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          imagem TEXT NOT NULL,
          link TEXT NOT NULL,
          titulo TEXT NOT NULL,
          clicks INTEGER NOT NULL,
          data_postagem TEXT NOT NULL
        )`,
        (err) => {
          if (err) {
            console.error('Table creation error:', err);
            return reject(err);
          }
          resolve(db);
        }
      );
    });
  });
}

const dbPromise = openDb();

export const dbRun = async (sql, params = []) => {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const dbAll = async (sql, params = []) => {
  const db = await dbPromise;
  return promisify(db.all.bind(db))(sql, params);
};