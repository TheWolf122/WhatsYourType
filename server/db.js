import Database from 'better-sqlite3';

const db = new Database(process.env.DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS pokemon (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    sprite_url  TEXT,
    type_1      TEXT,
    type_2      TEXT,
    generation  INTEGER,
    is_legendary INTEGER,
    is_mythical  INTEGER
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id              TEXT PRIMARY KEY,
    created_at      DATETIME,
    last_active_at  DATETIME
  );

  CREATE TABLE IF NOT EXISTS votes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT REFERENCES sessions(id),
    pokemon_id INTEGER REFERENCES pokemon(id),
    decision   TEXT,
    voted_at   DATETIME
  );
`);

export default db;
