const mongoose = require('mongoose');
async function connect() {
    try {
        await mongoose.connect('mongodb://localhost:27017/book_service', {});
        console.log('Connect successfully');
    } catch (error) {
        console.log('Connect failue');
    }
}

module.exports = { connect };
