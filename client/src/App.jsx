import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PostProvider } from './contexts/PostContext';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import PostList from './components/Posts/PostList';
import PostDetail from './components/Posts/PostDetail';
import PostForm from './components/Posts/PostForm';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import './App.css';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Register />
          } 
        />

        {/* Protected routes */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <PostProvider>
                <Layout>
                  <Routes>
                    <Route path="/" element={<PostList />} />
                    <Route path="/posts/:id" element={<PostDetail />} />
                    <Route path="/create" element={<PostForm />} />
                    <Route path="/edit/:id" element={<PostForm />} />
                  </Routes>
                </Layout>
              </PostProvider>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;