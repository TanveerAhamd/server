const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
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
    FeedbackMessage: {
        type: String,
        required: true,
    },

},{ timestamps: true });

// complainSchema.pre('save', function (next) {
//     if (!this.Requestid) {
//         this.Requestid = uuidv4().slice(0,5);
//     }
//     next();
// });

const Feedback = mongoose.model('Feedback', FeedbackSchema);

module.exports = Feedback;

