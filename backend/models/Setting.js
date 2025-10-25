const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  general: {
    siteName: { type: String, default: 'Campus Ballot' },
    siteLogo: { type: String, default: '' }
  },
  email: {
    smtpHost: { type: String, default: '' },
    smtpPort: { type: Number, default: 587 }
  },
  notifications: {
    notifyOnVote: { type: Boolean, default: true }
  },
  security: {
    enforceMfa: { type: Boolean, default: false },
    mfaGraceDays: { type: Number, default: 7 }
  }
}, { timestamps: true });

// Ensure a single-document collection behaviour is easy to query (we'll keep just one document)
const Setting = mongoose.model('Setting', settingsSchema);
module.exports = Setting;
