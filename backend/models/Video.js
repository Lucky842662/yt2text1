import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    youtubeUrl: {
      type: String,
      required: [true, 'YouTube URL is required'],
    },
    videoId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: 'Untitled Video',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    channelName: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '',
    },
    transcript: {
      type: String,
      default: '',
    },
    summary: {
      type: String,
      default: '',
    },
    keyPoints: [
      {
        type: String,
      },
    ],
    language: {
      type: String,
      default: 'en',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    errorMessage: {
      type: String,
      default: '',
    },
    transcriptSource: {
      type: String,
      enum: ['youtube', 'whisper', 'manual'],
      default: 'youtube',
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index for user's videos sorted by date
videoSchema.index({ userId: 1, createdAt: -1 });
videoSchema.index({ userId: 1, videoId: 1 }, { unique: true });

// Calculate word count before saving
videoSchema.pre('save', function (next) {
  if (this.isModified('transcript') && this.transcript) {
    this.wordCount = this.transcript.split(/\s+/).filter(Boolean).length;
  }
  next();
});

const Video = mongoose.model('Video', videoSchema);
export default Video;
