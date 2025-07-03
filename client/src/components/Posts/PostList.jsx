import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PostContext } from '../../contexts/PostContext';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';
import './PostList.css';

const PostList = () => {
  const { posts, loading, error, fetchPosts } = useContext(PostContext);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Add safety check here - this is the fix!
  const filteredPosts = Array.isArray(posts) ? posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="post-list">
      <div className="post-list-header">
        <h1>Blog Posts</h1>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="no-posts">
          <p>No posts found.</p>
          <Link to="/create" className="btn btn-primary">
            Create your first post
          </Link>
        </div>
      ) : (
        <div className="posts-grid">
          {filteredPosts.map(post => (
            <div key={post._id} className="post-card">
              {post.featuredImage && (
                <img 
                  src={post.featuredImage} 
                  alt={post.title}
                  className="post-image"
                />
              )}
              <div className="post-content">
                <h2 className="post-title">
                  <Link to={`/posts/${post._id}`}>
                    {post.title}
                  </Link>
                </h2>
                <p className="post-excerpt">
                  {post.content.substring(0, 150)}...
                </p>
                <div className="post-meta">
                  <span className="post-category">
                    {post.category?.name}
                  </span>
                  <span className="post-date">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="post-tags">
                  {post.tags && post.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostList;