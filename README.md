# Appointment Reminders

A Next.js application for managing healthcare appointments and reminders.

## Features

- User authentication with Supabase
- Appointment scheduling and management
- Dashboard to view upcoming appointments
- Screening and recommendation system

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account (for authentication and database)

## Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd appointment-reminders
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can get these values from your Supabase project dashboard.

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Authentication Setup

This application uses two authentication methods:

1. **Magic Link (Email)** - Passwordless authentication via email link
2. **Google OAuth** - Sign in with Google

### Testing Authentication

For testing purposes:

- **Magic Link**: Use any email address during development. Supabase will send a magic link to the provided email.
- **Google OAuth**: This requires setting up your own Google OAuth credentials.

### Setting Up Google OAuth (For Developers)

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/)
2. Go to "APIs & Services" > "Credentials"
3. Click "Create Credentials" > "OAuth client ID"
4. Set the application type to "Web application"
5. Add authorized JavaScript origins:
   - For development: `http://localhost:3000`
   - For production: Your domain (e.g., `https://your-app.vercel.app`)
6. Add authorized redirect URIs:
   - For development: `http://localhost:3000/auth/callback`
   - For production: `https://your-app.vercel.app/auth/callback`
7. Copy the Client ID and Client Secret
8. In your Supabase dashboard:
   - Go to Authentication > Providers > Google
   - Enable Google auth
   - Enter your Client ID and Client Secret
   - Save changes

During development, Google OAuth might require additional verification if you're using a personal Google account. For testing purposes, Magic Link authentication is recommended.

## Project Structure

- `/src/app` - Next.js application routes and pages
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and services
- `/src/lib/supabase` - Supabase client configuration

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [React](https://reactjs.org/) - UI library
- [Supabase](https://supabase.io/) - Backend as a Service (authentication & database)
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) - Type checking

## Deployment

The application can be deployed on [Vercel](https://vercel.com/):

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Configure environment variables
4. Deploy

Alternatively, build the application locally and deploy to any hosting provider that supports Node.js:

```bash
npm run build
npm run start
```

## License

See the [LICENSE](LICENSE) file for more information.
