const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const db = require('./src/config/db');
const Order = require('./src/models/order');
const Consul = require('consul');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());

const port = 5000;
const HOST = 'localhost';

db.connect();

const consul = new Consul();
const CONSUL_ID = uuidv4();

const details = {
    name: 'orders',
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
    console.log('Orders service registered with Consul');

    setInterval(() => {
        consul.agent.check.pass({ id: `service:${CONSUL_ID}` }, (err) => {
            if (err) throw new Error(err);
            console.log('Orders service told Consul that we are healthy');
        });
    }, 5 * 1000);
});

async function getCustomerServiceHost() {
    try {
        const services = await consul.catalog.service.list();
        console.log(services);
        const customerService = await consul.catalog.service.nodes('customers');

        if (customerService && customerService.length > 0) {
            return `http://${customerService[0].ServiceAddress}:${customerService[0].ServicePort}`;
        } else {
            throw new Error('Customers service not found in Consul');
        }
    } catch (err) {
        console.error('Error fetching customer service from Consul:', err);
        throw err;
    }
}

async function getBookServiceHost() {
    try {
        const services = await consul.catalog.service.list();
        console.log(services);
        const bookService = await consul.catalog.service.nodes('books');
        if (bookService && bookService.length > 0) {
            return `http://${bookService[0].ServiceAddress}:${bookService[0].ServicePort}`;
        } else {
            throw new Error('Books service not found in Consul');
        }
    } catch (err) {
        console.error('Error fetching book service from Consul:', err);
        throw err;
    }
}

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

app.delete('/order/:id', (req, res) => {
    Order.deleteOne({ _id: req.params.id })
        .then((order) => {
            res.send('order removed successfully');
        })
        .catch((err) => {});
});

app.get('/order/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).send('Order not found');
        }

        const customerServiceHost = await getCustomerServiceHost();
        const bookServiceHost = await getBookServiceHost();

        const customerResponse = await axios
            .get(`${customerServiceHost}/customers/${order.CustomerID}`)
            .catch((error) => {
                throw new Error(
                    `Error fetching customer details: ${error.message}`
                );
            });

        const bookResponse = await axios
            .get(`${bookServiceHost}/books/${order.BookID}`)
            .catch((error) => {
                throw new Error(
                    `Error fetching book details: ${error.message}`
                );
            });

        const orderObject = {
            customerName: customerResponse.data.name,
            customerAddress: customerResponse.data.address,
            bookTitle: bookResponse.data.title,
            bookAuthor: bookResponse.data.author,
        };

        res.json(orderObject);
    } catch (err) {
        console.error('Error fetching order details:', err);
        res.status(500).send('Error fetching order details');
    }
});

app.listen(port, () => {
    console.log(`Orders service listening on http://localhost:${port}`);
});
