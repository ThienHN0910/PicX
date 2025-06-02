# Art Marketplace

A modern platform for artists to showcase and sell their artwork, connecting creators with art enthusiasts worldwide.

## Features

- **User Authentication**
  - Email-based registration and login
  - Artist profile management
  - Secure authentication via Supabase

- **Artwork Management**
  - Upload and manage artwork
  - Set pricing and availability
  - Categorize artwork
  - Track views and likes

- **Shopping Experience**
  - Browse artwork by category
  - Search functionality
  - Favorite artwork
  - Shopping cart
  - Secure checkout

- **Social Features**
  - Comment on artwork
  - Follow artists
  - Direct messaging
  - Reviews and ratings

- **Artist Dashboard**
  - Sales analytics
  - Order management
  - Earnings tracking
  - Profile customization

## Tech Stack

- **Frontend**
  - React 18
  - TypeScript
  - Tailwind CSS
  - Lucide React Icons
  - React Router DOM

- **Backend**
  - Supabase
  - PostgreSQL Database
  - Row Level Security
  - Edge Functions

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── lib/           # Utility functions and hooks
│   ├── types/         # TypeScript type definitions
│   └── App.tsx        # Main application component
├── supabase/
│   └── migrations/    # Database migrations
└── public/           # Static assets
```

## Database Schema

The application uses a comprehensive database schema including:

- User authentication and profiles
- Artwork and categories
- Orders and payments
- Comments and reviews
- Chat messages
- Notifications
- Financial reports

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for your own purposes.