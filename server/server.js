const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "test1"
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

app.get('/', (req, res) => {
    const sql = "SELECT * FROM books";
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching books:', err);
            return res.status(500).json({ error: 'Error fetching books' });
        }
        res.status(200).json(result);
    });
});

app.post('/books', (req, res) => {
    const { title, author, isbn, createdAt, genre } = req.body;
    const sql = "INSERT INTO books (Title, Author, ISBN, PublishedDate, Genre) VALUES (?, ?, ?, ?, ?)";
    const values = [title, author, isbn, createdAt, genre];
    
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Error inserting data' });
        }
        res.status(201).json(result);
    });
});

app.put('/books/:id', (req, res) => {
    const { id } = req.params;
    const { title, author, isbn, createdAt, genre } = req.body;

    const sql = `
        UPDATE books
        SET Title = ?, Author = ?, ISBN = ?, PublishedDate = ?, Genre = ?
        WHERE id = ?
    `;

    const values = [title, author, isbn, createdAt, genre, id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating book:', err);
            return res.status(500).json({ error: 'Error updating book' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json({ message: 'Book updated successfully' });
    });
});

app.get('/read/:id', (req, res) => {
    const bookId = req.params.id;
    const sql = "SELECT * FROM books WHERE id = ?";
    
    db.query(sql, [bookId], (err, result) => {
        if (err) {
            console.error('Error fetching book:', err);
            return res.status(500).json({ error: 'Error fetching book' });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const book = result[0];
        const formattedDate = book.PublishedDate instanceof Date ? 
            book.PublishedDate.toISOString().split('T')[0] : 
            book.PublishedDate;

        res.status(200).json({
            ...book,
            PublishedDate: formattedDate
        });
    });
});


app.delete('/books/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM books WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting book:', err);
            return res.status(500).json({ error: 'Error deleting book' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json({ message: 'Book deleted successfully' });
    });
});

app.delete('/books', (req, res) => {
    const sql = "DELETE FROM books";
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error deleting all books:', err);
            return res.status(500).json({ error: 'Error deleting all books' });
        }
        res.status(200).json({ message: 'All books deleted successfully' });
    });
});


app.listen(8081, () => {
    console.log("Server is running on http://localhost:8081");
});
