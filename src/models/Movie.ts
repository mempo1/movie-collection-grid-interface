import mongoose, { Document } from 'mongoose';

export interface IMovie extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  releaseDate?: Date;
  genre?: string;
  rating?: number;
  chatRating?: number;
  posterUrl: string;
  status: 'Dropped' | 'Watching' | 'Planned' | 'Viewed';
  type: 'Movie' | 'Series' | 'Documentary' | 'Anime' | 'Cartoon';
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MovieSchema = new mongoose.Schema<IMovie>({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String,
    required: false
  },
  releaseDate: { 
    type: Date, 
    required: false
  },
  genre: { 
    type: String,
    required: false
  },
  rating: { 
    type: Number, 
    required: false,
    min: 0,
    max: 10 
  },
  chatRating: {
    type: Number,
    required: false,
    min: 0,
    max: 10
  },
  posterUrl: { 
    type: String, 
    required: true 
  },
  status: {
    type: String,
    required: true,
    enum: ['Dropped', 'Watching', 'Planned', 'Viewed']
  },
  type: {
    type: String,
    required: true,
    enum: ['Movie', 'Series', 'Documentary', 'Anime', 'Cartoon']
  },
  link: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Check if the model exists before creating a new one
const Movie = mongoose.models.Movie || mongoose.model<IMovie>('Movie', MovieSchema);

export default Movie;