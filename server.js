const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const { scrapeOldestArticles } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Scrape articles on startup
scrapeOldestArticles();

// CRUD APIs

// 1. Get all articles
app.get('/articles', (req, res) => {
    db.all('SELECT * FROM articles ORDER BY date DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// 2. Get a single article
app.get('/articles/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM articles WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json(row);
    });
});

// 3. Create a new article
app.post('/articles', (req, res) => {
    const { title, link, date, excerpt } = req.body;
    if (!title || !link) {
        return res.status(400).json({ error: 'Title and Link are required' });
    }
    const sql = 'INSERT INTO articles (title, link, date, excerpt) VALUES (?, ?, ?, ?)';
    const params = [title, link, date, excerpt];
    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, title, link, date, excerpt });
    });
});

// 4. Update an article
app.put('/articles/:id', (req, res) => {
    const { id } = req.params;
    const { title, link, date, excerpt } = req.body;
    const sql = 'UPDATE articles SET title = ?, link = ?, date = ?, excerpt = ? WHERE id = ?';
    const params = [title, link, date, excerpt, id];
    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json({ message: 'Article updated', id });
    });
});

// 5. Delete an article
app.delete('/articles/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM articles WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json({ message: 'Article deleted', id });
    });
});

// Manual scrape trigger
app.post('/scrape', async (req, res) => {
    try {
        await scrapeOldestArticles();
        res.json({ message: 'Scraping triggered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
