const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const DATA_FILE = path.join(__dirname, 'data', 'sessions.json');
const PORT = 3001;

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return { sessions: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/sessions', (req, res) => {
  res.json(readData().sessions);
});

app.post('/api/sessions', (req, res) => {
  const data = readData();
  const session = req.body;
  data.sessions.push(session);
  data.sessions.sort((a, b) => a.date.localeCompare(b.date));
  writeData(data);
  res.json(session);
});

app.patch('/api/sessions/:id', (req, res) => {
  const id = Number(req.params.id);
  const data = readData();
  const idx = data.sessions.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.sessions[idx] = req.body;
  writeData(data);
  res.json(data.sessions[idx]);
});

app.delete('/api/sessions/:id', (req, res) => {
  const id = Number(req.params.id);
  const data = readData();
  data.sessions = data.sessions.filter(s => s.id !== id);
  writeData(data);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Stats dashboard running at http://localhost:${PORT}`);
});
