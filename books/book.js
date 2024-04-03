const express = require('express');
const Book = require('./src/models/Books');
const db = require('./src/config/db');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

db.connect();

app.get('/', (req, res) => {
    res.send('Welcome');
});

app.post('/book', (req, res) => {
    const newBook = req.body;
    const book = new Book(newBook);
    book.save()
        .then(() => res.send('a new book created'))
        .catch((err) => {});
});

app.get('/books', (req, res) => {
    Book.find()
        .then((books) => {
            res.json(books);
        })
        .catch((err) => {});
});

app.get('/books/:id', (req, res) => {
    Book.findById(req.params.id)
        .then((book) => {
            res.json(book);
        })
        .catch((err) => {});
});

app.delete('/books/:id', (req, res) => {
    Book.deleteOne({ _id: req.params.id })
        .then((book) => {
            res.send('Book removed successfully');
        })
        .catch((err) => {});
});

app.listen(port, () => {
    console.log(`Books service is running on http://localhost:${port}`);
});
