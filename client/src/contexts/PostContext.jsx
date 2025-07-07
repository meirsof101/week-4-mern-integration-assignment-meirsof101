import React, { createContext, useState, useCallback } from 'react';
import { postService } from '../services/api'; // Adjust path as needed

export const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async (page = 1, limit = 100, category = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await postService.getAllPosts(page, limit, category);
      
      if (data && data.posts && Array.isArray(data.posts)) {
        setPosts(data.posts);
        console.log(`Loaded ${data.posts.length} posts (Total: ${data.total})`);
      } else {
        console.error('Unexpected API response structure:', data);
        setPosts([]);
      }
      
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = async (postData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug token information
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      console.log('=== DEBUG TOKEN INFO ===');
      console.log('Token exists:', !!token);
      console.log('Token length:', token?.length);
      console.log('Token preview:', token?.substring(0, 20) + '...');
      console.log('User exists:', !!user);
      console.log('User data:', user ? JSON.parse(user) : null);
      console.log('========================');
      
      // Remove the token check for now - let the API handle it
      // The axios interceptor will add the token automatically
      
      const newPost = await postService.createPost(postData);
      
      // Add the new post to the beginning of the posts array
      setPosts(prev => Array.isArray(prev) ? [newPost, ...prev] : [newPost]);
      
      return newPost;
    } catch (err) {
      console.error('Error creating post:', err);
      console.log('Error status:', err.response?.status);
      console.log('Error data:', err.response?.data);
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        const errorMessage = 'Session expired. Please log in again.';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create post';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (id, postData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedPost = await postService.updatePost(id, postData);
      
      setPosts(prev => Array.isArray(prev) ? prev.map(post => 
        post._id === id ? updatedPost : post
      ) : [updatedPost]);
      
      return updatedPost;
    } catch (err) {
      console.error('Error updating post:', err);
      
      if (err.response?.status === 401) {
        const errorMessage = 'Session expired. Please log in again.';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update post';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await postService.deletePost(id);
      
      setPosts(prev => Array.isArray(prev) ? prev.filter(post => post._id !== id) : []);
      
    } catch (err) {
      console.error('Error deleting post:', err);
      
      if (err.response?.status === 401) {
        const errorMessage = 'Session expired. Please log in again.';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete post';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const searchPosts = async (query) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await postService.searchPosts(query);
      
      if (data.posts && Array.isArray(data.posts)) {
        return data.posts;
      } else if (Array.isArray(data)) {
        return data;
      } else if (data.data && Array.isArray(data.data)) {
        return data.data;
      } else {
        return [];
      }
      
    } catch (err) {
      console.error('Error searching posts:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to search posts';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const value = {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    searchPosts,
  };

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  );
};