const mongoose = require('mongoose');

const ballotSchema = new mongoose.Schema({
    election: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true
    },
    position: {
        type: String,
        required: true
    },
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate'
        // Not required if abstaining
    },
    // Anonymous demographics for analytics
    faculty: String,
    department: String,
    yearOfStudy: String,
    gender: String,
    
    status: {
        type: String,
        enum: ['valid', 'void', 'spoiled'],
        default: 'valid'
    }
}, { timestamps: true });

ballotSchema.index({ election: 1, position: 1 });
ballotSchema.index({ candidate: 1 });

module.exports = mongoose.model('Ballot', ballotSchema);