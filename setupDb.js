const pgp = require('pg-promise')();
require('dotenv').config();

const db = pgp(process.env.DATABASE_URL);

async function setupDb() {
  const createTableQuery = `
    DROP TABLE IF EXISTS planets;
    CREATE TABLE planets(
      id SERIAL NOT NULL PRIMARY KEY,
      name TEXT NOT NULL
    );
  `;
  
  try {
    await db.none(createTableQuery);
    console.log('Tabella "planets" creata con successo!');
    await db.none('INSERT INTO planets (name) VALUES ($1)', ['Earth']);
    await db.none('INSERT INTO planets (name) VALUES ($1)', ['Mars']);
    console.log('Dati inseriti con successo!');
  } catch (error) {
    console.error('Errore nella creazione della tabella o nell\'inserimento dei dati:', error);
  }
}

setupDb();