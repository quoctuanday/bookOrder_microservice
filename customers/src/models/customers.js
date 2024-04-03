const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Customer = new Schema(
    {
        name: { type: String, maxLength: 255, required: true },
        age: { type: Number, maxLength: 255, required: true },
        address: { type: String, maxLength: 255, require: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Customer', Customer);
