import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PostContext } from '../../contexts/PostContext';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';
import './PostForm.css';

const PostForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createPost, updatePost } = useContext(PostContext);
  const { data: categories, loading: categoriesLoading } = useApi('/api/categories');
  
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    featuredImage: '',
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
            featuredImage: post.featuredImage || '',
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
        featuredImage: formData.featuredImage || undefined,
        status: formData.status,
        author: '6863c337f78d9fdb3f0ad1af' // Hardcoded for now
      };
      
      // Debug: Log what we're sending
      console.log('Form - Sending post data:', postData);
      
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
    <div className="post-form-container">
      <h1>{isEditing ? 'Edit Post' : 'Create New Post'}</h1>
      
      {error && <ErrorMessage message={error} />}
      
      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={validationErrors.title ? 'error' : ''}
            placeholder="Enter post title"
          />
          {validationErrors.title && (
            <span className="error-text">{validationErrors.title}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            className={validationErrors.content ? 'error' : ''}
            placeholder="Write your post content..."
            rows="10"
          />
          {validationErrors.content && (
            <span className="error-text">{validationErrors.content}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={validationErrors.category ? 'error' : ''}
          >
            <option value="">Select a category</option>
            {!categoriesLoading && categories?.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          {validationErrors.category && (
            <span className="error-text">{validationErrors.category}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="Enter tags separated by commas"
          />
          <small className="help-text">Separate multiple tags with commas</small>
        </div>

        <div className="form-group">
          <label htmlFor="featuredImage">Featured Image URL</label>
          <input
            type="url"
            id="featuredImage"
            name="featuredImage"
            value={formData.featuredImage}
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;