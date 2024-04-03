const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Book = new Schema(
    {
        title: { type: String, maxLength: 255, required: true },
        author: { type: String, maxLength: 255, required: true },
        numberPages: { type: Number, maxLength: 255, required: false },
        publisher: { type: String, maxLength: 255, require: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Book', Book);
