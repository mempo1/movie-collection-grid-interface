# Movie Collection Grid Interface

A Next.js application for managing and displaying a movie collection with user authentication, admin panel, and MongoDB integration.
Copy zip.file unzip it to a place convenient for you unzip it to a convenient location for you, in a new terminal install dependencies using the command npm install --legacy-peer-deps -> npm run dev

## Project Structure

### Client-Side (Frontend)
Located in:
```
src/
├── app/                    # Page components
│   ├── page.tsx           # Main movie grid page
│   ├── admin/page.tsx     # Admin panel
│   ├── movies/[id]/       # Individual movie pages
│   ├── profile/           # User profile page
│   └── auth/              # Authentication pages
├── components/            # Reusable React components
│   ├── features/          # Feature-specific components
│   │   ├── MovieCard.tsx  # Movie card component
│   │   └── CommentSection.tsx
│   └── layout/           # Layout components
│       ├── Header.tsx
│       ├── SearchBar.tsx
│       └── FilterBar.tsx
```

Client-side components handle:
- User interface rendering
- State management
- User interactions
- Client-side routing
- Form handling
- Data display
- Real-time updates

### Server-Side (Backend)
Located in:
```
src/
├── api/                   # API routes
│   ├── movies/           # Movie-related endpoints
│   │   ├── route.ts      # Main movie CRUD operations
│   │   └── [id]/         # Individual movie operations
│   └── auth/             # Authentication endpoints
├── lib/                  # Server utilities
│   └── db.ts            # Database connection
├── models/              # Database models
│   ├── Movie.ts        # Movie schema
│   ├── User.ts         # User schema
│   └── Comment.ts      # Comment schema
└── middleware.ts       # Server middleware
```

Server-side components handle:
- Database operations
- Authentication
- API endpoints
- Data validation
- Business logic
- File operations
- Security

## Features

### User Features
- Browse movies in a responsive grid layout
- Filter movies by:
  * Status (Dropped/Watching/Planned/Viewed)
  * Type (Movie/Series/Documentary/Anime/Cartoon)
  * Link availability
- Sort movies by date, rating, and chat rating
- Search functionality
- User registration and authentication
- User profiles
- Comment system

### Admin Features
- Protected admin panel
- Full CRUD operations for movies
- User management
- Role-based access control

## Tech Stack

### Frontend
- Next.js 13+ (React framework)
- React (UI library)
- TypeScript (Type safety)
- Tailwind CSS (Styling)
- Lucide React (Icons)

### Backend
- Next.js API Routes
- MongoDB (Database)
- Mongoose (ODM)
- NextAuth.js (Authentication)
- bcrypt (Password hashing)

## Setup Instructions

### Prerequisites
1. Install Node.js and npm
2. Install MongoDB Community Server
3. Install MongoDB Compass (optional, for database management)

### Environment Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with the following content:
   ```env
   MONGODB_URI=mongodb://localhost:27017/movies
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   ```

### Database Setup
1. Start MongoDB service
2. Create admin user:
   ```bash
   npm run create-admin
   ```
   This will create an admin user with:
   - Email: admin@example.com
   - Password: admin123

### Running the Application
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Access the application:
   - Main interface: [http://localhost:3000](http://localhost:3000)
   - Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

## API Routes

### Public Routes
- `GET /api/movies` - List all movies with filtering and pagination
- `GET /api/movies/[id]` - Get specific movie details

### Protected Routes (Admin Only)
- `POST /api/movies` - Create new movie
- `PUT /api/movies/[id]` - Update movie
- `DELETE /api/movies/[id]` - Delete movie

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/signout` - User logout

## Database Models

### Movie Model
```typescript
{
  title: string;          // Required
  description?: string;   // Optional
  releaseDate?: Date;    // Optional
  genre?: string;        // Optional
  rating?: number;       // Optional (0-10)
  chatRating?: number;   // Optional (0-10)
  posterUrl: string;     // Required
  status: 'Dropped' | 'Watching' | 'Planned' | 'Viewed';  // Required
  type: 'Movie' | 'Series' | 'Documentary' | 'Anime' | 'Cartoon';  // Required
  link?: string;         // Optional
}
```

### User Model
```typescript
{
  username: string;
  email: string;
  password: string;      // Hashed
  role: 'user' | 'admin';
}
```

### Comment Model
```typescript
{
  content: string;
  movie: ObjectId;       // Reference to Movie
  user: ObjectId;        // Reference to User
  createdAt: Date;
}
```

## Security Features
- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- Role-based access control
- Input validation
- XSS protection
- CSRF protection

## Error Handling
- Client-side form validation
- Server-side input validation
- Proper error responses
- Detailed error logging
- User-friendly error messages

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License.
