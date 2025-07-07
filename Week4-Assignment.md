# 🔄 Week 4: Deep Dive into MERN Stack Integration - COMPLETED

## 🚀 Project Overview
This repository contains a full-stack MERN (MongoDB, Express.js, React.js, Node.js) blog application that demonstrates seamless integration between front-end and back-end components, including database operations, API communication, and state management.

## ✅ Completed Tasks

### ✅ Task 1: Project Setup
- [x] Set up project with clear directory structure for both client and server
- [x] Configured MongoDB connection using Mongoose
- [x] Set up Express.js server with necessary middleware
- [x] Created React front-end using Vite and configured proxy for API calls
- [x] Implemented environment variables for configuration management

### ✅ Task 2: Back-End Development
- [x] Designed and implemented RESTful API for blog application with endpoints:
  - `GET /api/posts`: Get all blog posts
  - `GET /api/posts/:id`: Get a specific blog post
  - `POST /api/posts`: Create a new blog post
  - `PUT /api/posts/:id`: Update an existing blog post
  - `DELETE /api/posts/:id`: Delete a blog post
  - `GET /api/categories`: Get all categories
  - `POST /api/categories`: Create a new category
- [x] Created Mongoose models for `Post` and `Category` with proper relationships
- [x] Implemented input validation using express-validator
- [x] Added error handling middleware for API routes

### ✅ Task 3: Front-End Development
- [x] Created React components for:
  - Post list view
  - Single post view
  - Create/edit post form
  - Navigation and layout
- [x] Implemented React Router for navigation between different views
- [x] Used React hooks for state management (useState, useEffect, useContext)
- [x] Created custom hook for API calls

### ✅ Task 4: Integration and Data Flow
- [x] Implemented API service in React to communicate with the back-end
- [x] Set up state management for posts and categories
- [x] Created forms with proper validation for creating and editing posts
- [x] Implemented optimistic UI updates for better user experience
- [x] Handled loading and error states for API calls

### ✅ Task 5: Advanced Features
- [x] Added user authentication (registration, login, protected routes)
- [x] Implemented image uploads for blog post featured images
- [x] Added pagination for the post list
- [x] Implemented searching and filtering functionality
- [x] Added comments feature for blog posts

## 🛠️ Technology Stack
- **Frontend**: React 18, Vite, React Router, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Package Manager**: pnpm
- **Process Management**: concurrently
- **Authentication**: JWT tokens
- **File Upload**: Multer
- **Validation**: express-validator
- **Styling**: CSS3, Responsive Design

## 📁 Project Structure
```
mern-blog/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
            ├── Auth
            ├── Layout
            ├── Posts
            ├── UI
            ├── ProtectedRoute.jsx
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   ├── public/
│   └── package.json
├── server/                 # Express backend
|   ├── config/
|   ├── server.js
|   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── package.json
├── screenshots/            # Application screenshots
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or MongoDB Atlas)
- pnpm package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 'week-4-mern-integration-assignment-meirsof101'
   ```

2. **Install dependencies using pnpm**
   ```bash
   # Install server dependencies
   cd server
   pnpm install
   
   # Install client dependencies
   cd ../client
   pnpm install
   ```

3. **Environment Setup**
   
   Create `.env` files in both server and client directories:
   
   **Server (.env)**
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mern-blog
   JWT_SECRET=your-jwt-secret
   NODE_ENV=development
   ```
   
   **Client (.env)**
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the application**
   ```bash
   # From root directory, run both client and server concurrently
   pnpm run dev
   ```

## 🔧 Available Scripts

### Root Level Scripts
- `pnpm run dev`: Start both client and server concurrently
- `pnpm run server`: Start only the server
- `pnpm run client`: Start only the client

### Server Scripts
- `pnpm start`: Start production server
- `pnpm run dev`: Start development server with nodemon

### Client Scripts
- `pnpm run dev`: Start development server
- `pnpm run build`: Build for production
- `pnpm run preview`: Preview production build

## 📖 API Documentation

### Posts Endpoints
- `GET /api/posts` - Get all blog posts (with pagination)
- `GET /api/posts/:id` - Get specific blog post
- `POST /api/posts` - Create new blog post (protected)
- `PUT /api/posts/:id` - Update blog post (protected)
- `DELETE /api/posts/:id` - Delete blog post (protected)

### Categories Endpoints
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category (protected)

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

## 🎨 Features Implemented

### Core Features
- ✅ Full CRUD operations for blog posts
- ✅ Category management
- ✅ Responsive design
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states

### Advanced Features
- ✅ User authentication & authorization
- ✅ Image upload for featured images
- ✅ Pagination
- ✅ Search and filtering
- ✅ Protected routes
- ✅ Optimistic UI updates

## 📸 Screenshots

Application screenshots are available in the `screenshots/` folder:
- Homepage with post list
- Single post view
- Create/Edit post form
- User authentication
- Search and filtering
- Comments section
- Mobile responsive views

## 🧪 Testing

The application has been thoroughly tested with:
- API endpoint testing using Postman
- Frontend component testing
- Integration testing between client and server
- User authentication flow testing
- File upload functionality testing

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Protected API routes
- CORS configuration
- Environment variable protection

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- Desktop devices
- Tablet devices
- Mobile devices

## 🚀 Deployment Ready

The application is configured for deployment with:
- Production build scripts
- Environment variable management
- Database connection handling
- Static file serving

## 📝 Future Enhancements

Potential improvements for future versions:
- Social media authentication
- Rich text editor for post content
- Tag system for posts
- User profiles and avatars
- Email notifications for comments
- SEO optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is part of Power Learn Project Assignments.

---

**Status**: ✅ **COMPLETED** - All tasks have been successfully implemented and tested.

Last updated: July 2025