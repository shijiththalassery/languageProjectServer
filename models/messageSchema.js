import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  roomNo: {
    type: mongoose.Schema.Types.ObjectId,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'student'
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tutor'
  },
  messages: [
    {
      text: {
        type: String,
        required: true
      },
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      userName: {
        type: String,
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, {
  timestamps: true
});

const messageModel = mongoose.model('Message', messageSchema);

export default messageModel;