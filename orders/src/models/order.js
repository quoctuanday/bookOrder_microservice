const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Order = new Schema(
    {
        CustomerID: {
            type: mongoose.SchemaTypes.ObjectId,
            maxLength: 255,
            required: true,
        },
        BookID: {
            type: mongoose.SchemaTypes.ObjectId,
            maxLength: 255,
            required: true,
        },
        initialDate: { type: Date, maxLength: 255, required: true },
        deliveryDate: { type: Date, maxLength: 255, require: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', Order);
