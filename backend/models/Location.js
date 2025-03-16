import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

LocationSchema.index({ location: '2dsphere' });
export default mongoose.model('Location', LocationSchema);