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
