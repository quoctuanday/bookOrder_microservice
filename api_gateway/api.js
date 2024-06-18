const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const Consul = require('consul');
const { PORT } = require('./config');

const app = express();
const port = PORT;
const consul = new Consul();

async function getCustomerServiceHost() {
    try {
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

async function getOrderServiceHost() {
    try {
        const orderService = await consul.catalog.service.nodes('orders');
        if (orderService && orderService.length > 0) {
            return `http://${orderService[0].ServiceAddress}:${orderService[0].ServicePort}`;
        } else {
            throw new Error('Orders service not found in Consul');
        }
    } catch (err) {
        console.error('Error fetching order service from Consul:', err);
        throw err;
    }
}

app.use('/book-service', async (req, res, next) => {
    try {
        const bookServiceHost = await getBookServiceHost();
        createProxyMiddleware({
            target: bookServiceHost,
            changeOrigin: true,
            pathRewrite: {
                '^/book-service': '',
            },
        })(req, res, next);
    } catch (err) {
        console.error('Error proxying to book service:', err);
        res.status(500).send('Error proxying to book service');
    }
});

app.use('/customer-service', async (req, res, next) => {
    try {
        const customerServiceHost = await getCustomerServiceHost();
        createProxyMiddleware({
            target: customerServiceHost,
            changeOrigin: true,
            pathRewrite: {
                '^/customer-service': '',
            },
        })(req, res, next);
    } catch (err) {
        console.error('Error proxying to customer service:', err);
        res.status(500).send('Error proxying to customer service');
    }
});

app.use('/order-service', async (req, res, next) => {
    try {
        const orderServiceHost = await getOrderServiceHost();
        createProxyMiddleware({
            target: orderServiceHost,
            changeOrigin: true,
            pathRewrite: {
                '^/order-service': '',
            },
        })(req, res, next);
    } catch (err) {
        console.error('Error proxying to order service:', err);
        res.status(500).send('Error proxying to order service');
    }
});

app.listen(port, () => {
    console.log(`API Gateway is running on http://localhost:${port}`);
});
