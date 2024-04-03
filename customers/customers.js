const express = require('express');
const app = express();
const db = require('./src/config/db');
const Customer = require('./src/models/customers');
const bodyParser = require('body-parser');

app.use(bodyParser.json());

const port = 4000;
db.connect();

app.post('/customer', (req, res) => {
    const newCustomer = req.body;
    const customer = new Customer(newCustomer);
    customer
        .save()
        .then(() => res.send('a new customer created'))
        .catch((err) => {});
});

app.get('/customer', (req, res) => {
    Customer.find()
        .then((customer) => {
            res.json(customer);
        })
        .catch((err) => {});
});

app.get('/customer/:id', (req, res) => {
    Customer.findById(req.params.id)
        .then((customer) => {
            res.json(customer);
        })
        .catch((err) => {});
});

app.delete('/customer/:id', (req, res) => {
    Customer.deleteOne({ _id: req.params.id })
        .then((customer) => {
            res.send('customer removed successfully');
        })
        .catch((err) => {});
});

app.listen(port, () => {
    console.log(`Customers service listening on http://localhost:${port}`);
});
