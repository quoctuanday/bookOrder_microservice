const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const db = require('./src/config/db');
const Order = require('./src/models/order');

const app = express();
app.use(bodyParser.json());

const port = 5000;
db.connect();

app.post('/order', (req, res) => {
    const newOrder = req.body;
    const order = new Order(newOrder);
    order
        .save()
        .then(() => res.send('a new Order created'))
        .catch((err) => {});
});

app.get('/order', (req, res) => {
    Order.find()
        .then((order) => {
            res.json(order);
        })
        .catch((err) => {});
});

app.get('/order/:id', (req, res) => {
    Order.findById(req.params.id)
        .then((order) => {
            if (order) {
                axios
                    .get('http://localhost:4000/customer/' + order.CustomerID)
                    .then((response) => {
                        const orderObject = {
                            customerName: response.data.name,
                            customerAddress: response.data.address,
                            bookTitle: '',
                            bookAuthor: '',
                        };
                        axios
                            .get('http://localhost:3000/books/' + order.BookID)
                            .then((response) => {
                                orderObject.bookTitle = response.data.title;
                                orderObject.bookAuthor = response.data.author;
                                res.json(orderObject);
                            });
                    });
            } else {
            }
        })
        .catch((err) => {});
});

// app.delete('/order/:id', (req, res) => {
//     Order.deleteOne({ _id: req.params.id })
//         .then((order) => {
//             res.send('order removed successfully');
//         })
//         .catch((err) => {});
// });

app.listen(port, () => {
    console.log(`Order is running on http://localhost:${port}`);
});
