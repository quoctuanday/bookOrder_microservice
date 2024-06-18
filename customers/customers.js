const express = require('express');
const db = require('./src/config/db');
const Customer = require('./src/models/customers');
const bodyParser = require('body-parser');
const Consul = require('consul');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 4000;
const HOST = 'localhost';
const consul = new Consul();
const CONSUL_ID = uuidv4();

app.use(bodyParser.json());
db.connect();

const details = {
    name: 'customers',
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
    console.log('Customers service registered with Consul');

    setInterval(() => {
        consul.agent.check.pass({ id: `service:${CONSUL_ID}` }, (err) => {
            if (err) throw new Error(err);
            console.log('Customers service told Consul that we are healthy');
        });
    }, 5 * 1000);
});

app.post('/customers', (req, res) => {
    const newCustomer = req.body;
    const customer = new Customer(newCustomer);
    customer
        .save()
        .then(() => res.send('A new customer created'))
        .catch((err) => {
            console.error('Error saving customer:', err);
            res.status(500).send('Error saving customer');
        });
});

app.get('/customers', (req, res) => {
    Customer.find()
        .then((customers) => {
            res.json(customers);
        })
        .catch((err) => {
            console.error('Error fetching customers:', err);
            res.status(500).send('Error fetching customers');
        });
});

app.get('/customers/:id', (req, res) => {
    Customer.findById(req.params.id)
        .then((customer) => {
            if (!customer) {
                return res.status(404).send('Customer not found');
            }
            res.json(customer);
        })
        .catch((err) => {
            console.error('Error fetching customer by id:', err);
            res.status(500).send('Error fetching customer by id');
        });
});

app.delete('/customers/:id', (req, res) => {
    Customer.deleteOne({ _id: req.params.id })
        .then((result) => {
            if (result.deletedCount === 0) {
                return res.status(404).send('Customer not found');
            }
            res.send('Customer removed successfully');
        })
        .catch((err) => {
            console.error('Error deleting customer:', err);
            res.status(500).send('Error deleting customer');
        });
});

app.listen(port, () => {
    console.log(`Customers service listening on http://localhost:${port}`);
});
