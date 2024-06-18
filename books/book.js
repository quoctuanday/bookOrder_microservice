const express = require('express');
const Book = require('./src/models/Books');
const db = require('./src/config/db');
const Consul = require('consul');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;
const HOST = 'localhost';

const consul = new Consul();
const CONSUL_ID = uuidv4();

const details = {
    name: 'books',
    address: HOST,
    port: port,
    id: CONSUL_ID,
    check: {
        ttl: '10s',
        deregister_critical_service_after: '1m',
    },
};

consul.agent.service.register(details, (err) => {
    if (err) throw err;
    console.log('Books service registered with Consul');

    setInterval(() => {
        consul.agent.check.pass({ id: `service:${CONSUL_ID}` }, (err) => {
            if (err) throw new Error(err);
            console.log('Books service told Consul that we are healthy');
        });
    }, 5 * 1000);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

db.connect();

app.get('/', (req, res) => {
    res.send('Welcome to books service');
});

app.post('/book', (req, res) => {
    const newBook = req.body;
    const book = new Book(newBook);
    book.save()
        .then(() => res.send('A new book created'))
        .catch((err) => {
            console.error('Error saving book:', err);
            res.status(500).send('Error saving book');
        });
});

app.get('/books', (req, res) => {
    Book.find()
        .then((books) => {
            res.json(books);
        })
        .catch((err) => {
            console.error('Error fetching books:', err);
            res.status(500).send('Error fetching books');
        });
});

app.get('/books/:id', (req, res) => {
    Book.findById(req.params.id)
        .then((book) => {
            if (!book) {
                return res.status(404).send('Book not found');
            }
            res.json(book);
        })
        .catch((err) => {
            console.error('Error fetching book by id:', err);
            res.status(500).send('Error fetching book by id');
        });
});

app.delete('/books/:id', (req, res) => {
    Book.deleteOne({ _id: req.params.id })
        .then((result) => {
            if (result.deletedCount === 0) {
                return res.status(404).send('Book not found');
            }
            res.send('Book removed successfully');
        })
        .catch((err) => {
            console.error('Error deleting book:', err);
            res.status(500).send('Error deleting book');
        });
});

app.listen(port, () => {
    console.log(`Books service is running on http://localhost:${port}`);
});
