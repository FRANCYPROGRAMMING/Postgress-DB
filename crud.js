const express = require('express');
const pgp = require('pg-promise')();
require('dotenv').config();

const app = express();
app.use(express.json());

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

app.get('/planets', async (req, res) => {
  try {
    const planets = await db.any('SELECT * FROM planets');
    res.json(planets);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero dei pianeti' });
  }
});

app.get('/planets/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const planet = await db.oneOrNone('SELECT * FROM planets WHERE id=$1', [id]);
    if (planet) {
      res.json(planet);
    } else {
      res.status(404).json({ error: 'Pianeta non trovato' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero del pianeta' });
  }
});

app.post('/planets', async (req, res) => {
  const { name } = req.body;
  try {
    await db.none('INSERT INTO planets (name) VALUES ($1)', [name]);
    res.status(201).json({ message: 'Pianeta creato con successo' });
  } catch (error) {
    res.status(500).json({ error: 'Errore nella creazione del pianeta' });
  }
});

app.put('/planets/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await db.none('UPDATE planets SET name=$2 WHERE id=$1', [id, name]);
    res.json({ message: 'Pianeta aggiornato con successo' });
  } catch (error) {
    res.status(500).json({ error: 'Errore nell\'aggiornamento del pianeta' });
  }
});

app.delete('/planets/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.none('DELETE FROM planets WHERE id=$1', [id]);
    res.json({ message: 'Pianeta eliminato con successo' });
  } catch (error) {
    res.status(500).json({ error: 'Errore nell\'eliminazione del pianeta' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});