const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); 

const complainSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
    },
    Email: {
        type: String,
        required: true,
    },
    Contact: {
        type: String,
        require: true
    },
    Department: {
        type: String,
        required: true,
    },
    Complainmessage: {
        type: String,
        required: true,
    },
    Requestid: {
        type: String,
        unique: true, 
        index: true, 
    },
    Status: {
        type: String,
        enum: ['ACTIVE', 'RESOLVED'], 
        default: 'ACTIVE',
    },
    Severity: {
        type: String,
        enum: ['NORMAL', 'HIGH', 'CRITICAL'], 
        default: 'NORMAL',
    },
},{ timestamps: true });

complainSchema.pre('save', function (next) {
    if (!this.Requestid) {
        this.Requestid = uuidv4().slice(0,5);
    }
    next();
});

const Complain = mongoose.model('Complain', complainSchema);

module.exports = Complain;

