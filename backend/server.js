const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('missions.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database');
    db.run(`
      CREATE TABLE IF NOT EXISTS missions (
        mission_id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT,
        coord TEXT,
        home TEXT,
        geoJSON TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
});

const createGeoJSON = (coordinates) => {
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: coordinates.map(coord => [coord.lng, coord.lat])
    },
    properties: {}
  };
};

class MissionModel {
  static async create(missionData) {
    const { nama, coord } = missionData;
    const home = coord[0];
    const geoJSON = createGeoJSON(coord);

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO missions (nama, coord, home, geoJSON)
        VALUES (?, ?, ?, ?)`,
        [
          nama,
          JSON.stringify(coord),
          JSON.stringify(home),
          JSON.stringify(geoJSON)
        ],
        function (err) {
          if (err) reject(err);
          resolve({
            mission_id: this.lastID,
            nama,
            coord,
            home,
            geoJSON
          });
        }
      );
    });
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM missions', [], (err, rows) => {
        if (err) reject(err);
        resolve(rows.map(row => ({
          ...row,
          coord: JSON.parse(row.coord),
          home: JSON.parse(row.home),
          geoJSON: JSON.parse(row.geoJSON)
        })));
      });
    });
  }
}

app.post('/api/missions', async (req, res) => {
  try {
    const mission = await MissionModel.create(req.body);
    res.status(201).json(mission);
  } catch (error) {
    console.error('Error creating mission:', error);
    res.status(500).json({ error: 'Failed to create mission' });
  }
});

app.get('/api/missions', async (req, res) => {
  try {
    const missions = await MissionModel.getAll();
    res.json(missions);
  } catch (error) {
    console.error('Error fetching missions:', error);
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});