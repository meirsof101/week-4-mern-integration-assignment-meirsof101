import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PostContext } from '../../contexts/PostContext';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';

const PostForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createPost, updatePost } = useContext(PostContext);
  const { data: categories, loading: categoriesLoading } = useApi('/api/categories');

// useEffect(() => {
//   if (categories && categories.length > 0) {
//     console.log('=== CATEGORY DEBUG ===');
//     console.log('Full categories array:', categories);
//     console.log('First category object:', categories[0]);
//     console.log('First category keys:', Object.keys(categories[0]));
//     console.log('First category name:', categories[0].name);
//     console.log('First category _id:', categories[0]._id);
//     console.log('=====================');
//   }
// }, [categories]);
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    featuredImageUrl: '',
    status: 'draft'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch post data if editing
  useEffect(() => {
    if (isEditing) {
      const fetchPost = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/posts/${id}`);
          if (!response.ok) throw new Error('Failed to fetch post');
          const post = await response.json();
          
          setFormData({
            title: post.title,
            content: post.content,
            category: post.category._id,
            tags: post.tags.join(', '),
            featuredImageUrl: post.featuredImageUrl || '',
            status: post.status || 'draft'
          });
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      
      fetchPost();
    }
  }, [id, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    }
    
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Process tags: convert comma-separated string to array
      const tagsArray = Array.isArray(formData.tags) 
        ? formData.tags 
        : formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      const postData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: tagsArray,
        featuredImageUrl: formData.featuredImageUrl || undefined,
        status: formData.status,
        author: '6863c337f78d9fdb3f0ad1af' // Hardcoded for now
      };
      
      // Debug: Log what we're sending
      // console.log('Form - Sending post data:', postData);
      
      if (isEditing) {
        await updatePost(id, postData);
      } else {
        await createPost(postData);
      }
      
      navigate('/');
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) return <LoadingSpinner />;
  if (error && isEditing) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Edit Post' : 'Create New Post'}
        </h1>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
              validationErrors.title 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="Enter post title"
          />
          {validationErrors.title && (
            <span className="text-red-500 text-sm">{validationErrors.title}</span>
          )}
        </div>

        {/* Content Field */}
        <div className="space-y-2">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Content *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-vertical ${
              validationErrors.content 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="Write your post content..."
            rows="10"
          />
          {validationErrors.content && (
            <span className="text-red-500 text-sm">{validationErrors.content}</span>
          )}
        </div>
{/* Category Field - Clean version */}
<div className="space-y-2">
  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
    Category *
  </label>
  <select
    id="category"
    name="category"
    value={formData.category}
    onChange={handleInputChange}
    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
      validationErrors.category 
        ? 'border-red-500 bg-red-50' 
        : 'border-gray-300 hover:border-gray-400'
    }`}
    disabled={categoriesLoading}
  >
    <option value="">
      {categoriesLoading ? 'Loading categories...' : 'Select a category'}
    </option>
    {Array.isArray(categories) && categories.map((category, index) => (
      <option key={index} value={category}>
        {category}
      </option>
    ))}
  </select>
  {validationErrors.category && (
    <span className="text-red-500 text-sm">{validationErrors.category}</span>
  )}
</div>
        {/* Tags Field */}
        <div className="space-y-2">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-400"
            placeholder="Enter tags separated by commas"
          />
          <small className="text-gray-500 text-sm">Separate multiple tags with commas</small>
        </div>

        {/* Featured Image Field */}
        <div className="space-y-2">
          <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700">
            Featured Image URL
          </label>
          <input
            type="url"
            id="featuredImage"
            name="featuredImageUrl"
            value={formData.featuredImageUrl}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-400"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Status Field */}
        <div className="space-y-2">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-400"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;