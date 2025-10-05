# Manage - Restaurant Management System

A full-stack restaurant management system built with React, Node.js, Express, and MongoDB. This application provides a complete solution for managing restaurant operations including menu items, orders, and customer interactions.

## Features

- 🍽️ **Menu Management**: Add, edit, and remove menu items with images and descriptions
- 🛒 **Order System**: Track and manage customer orders in real-time
- 📊 **Analytics Dashboard**: View sales reports and business insights
- 👥 **User Management**: Role-based access control for staff and administrators
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🌓 **Dark Mode**: Built-in dark and light themes

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Payments**: Paystack integration
- **Real-time Updates**: Socket.IO

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or later)
- npm (v9 or later) or yarn
- MongoDB (v6 or later) running locally or a MongoDB Atlas connection string

## Getting Started

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd manage-page
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd server && npm install && cd ..
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the environment variables in `.env` with your configuration

4. **Start the development server**
   ```bash
   # Start both frontend and backend
   npm run dev:full
   ```
   This will start:
   - Frontend on http://localhost:3000
   - Backend API on http://localhost:5000

## Database Setup

1. **Option 1: Local MongoDB**
   - Install MongoDB Community Edition
   - Make sure MongoDB is running locally
   - Update `MONGO_URI` in `.env` to `mongodb://localhost:27017/manage`

2. **Option 2: MongoDB Atlas**
   - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Get your connection string
   - Update `MONGO_URI` in `.env` with your connection string

3. **Seed the database** (optional)
   ```bash
   node server/seed.js
   ```
   This will populate your database with sample menu items.

## Available Scripts

- `npm run dev` - Start the Vite development server
- `npm run server` - Start the backend server
- `npm run dev:full` - Start both frontend and backend with a single command
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
manage-page/
├── public/                 # Static files
├── server/                 # Backend server
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middlewares/       # Custom middlewares
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── index.js           # Server entry point
│   └── seed.js            # Database seeder
├── src/                   # Frontend source code
│   ├── assets/            # Images, fonts, etc.
│   ├── components/        # Reusable UI components
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── App.jsx            # Main App component
│   └── main.jsx           # Application entry point
├── .env                  # Environment variables
├── package.json          # Project configuration
└── vite.config.js        # Vite configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository.
