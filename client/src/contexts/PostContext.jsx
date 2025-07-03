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
      
      // Your API returns { posts: [...], total: 10, totalPages: 0, currentPage: 1 }
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
      setPosts([]); // Ensure posts is always an array
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = async (postData) => {
    try {
      setLoading(true);
      setError(null);
      
      const newPost = await postService.createPost(postData);
      
      // Add the new post to the beginning of the posts array
      setPosts(prev => Array.isArray(prev) ? [newPost, ...prev] : [newPost]);
      
      return newPost;
    } catch (err) {
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
      
      // Update the post in the posts array
      setPosts(prev => Array.isArray(prev) ? prev.map(post => 
        post._id === id ? updatedPost : post
      ) : [updatedPost]);
      
      return updatedPost;
    } catch (err) {
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
      
      // Remove the post from the posts array
      setPosts(prev => Array.isArray(prev) ? prev.filter(post => post._id !== id) : []);
      
    } catch (err) {
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
      
      // Handle search results similar to fetchPosts
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
    searchPosts, // Added search functionality
  };

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  );
};