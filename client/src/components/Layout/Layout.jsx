import React from 'react';
import Navigation from './Navigation';
import './Layout.css';
import { useAuth } from '../../contexts/AuthContext';

const Layout = ({ children }) => {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">My Blog</h1>
          <div className="flex items-center space-x-4">
            <span>Welcome, {user?.name}!</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default Layout;