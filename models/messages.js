const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    complainid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complain', 
        required: true,
    },
    fromadmin: {
        type: String,
        default: null
    },
    fromcomplainer: {
        type: String,
        default: null
    },
}, { timestamps: true });

const message = mongoose.model('message', messageSchema);

module.exports = message;
