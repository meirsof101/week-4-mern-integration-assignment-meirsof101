import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PostContext } from '../../contexts/PostContext';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';

const PostList = () => {
  const { posts, loading, error, fetchPosts } = useContext(PostContext);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Fixed filtering with safety checks
  const filteredPosts = Array.isArray(posts) ? posts.filter(post => {
    // Safety checks to prevent undefined errors
    const title = post?.title || '';
    const content = post?.content || '';
    const searchLower = searchTerm.toLowerCase();
    
    return title.toLowerCase().includes(searchLower) ||
           content.toLowerCase().includes(searchLower);
  }) : [];

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
          Blog Posts
        </h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Link 
            to="/create" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
          >
            Create Post
          </Link>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* No Posts Message */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <p className="text-gray-600 text-lg mb-4">No posts found.</p>
            <Link 
              to="/create" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create your first post
            </Link>
          </div>
        </div>
      ) : (
        /* Posts Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <div key={post._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {/* Featured Image */}
              {post.featuredImage && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.featuredImage}
                    alt={post.title || 'Post image'}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              
              {/* Post Content */}
              <div className="p-6">
                {/* Post Title */}
                <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                  <Link 
                    to={`/posts/${post._id}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {post.title || 'Untitled Post'}
                  </Link>
                </h2>
                
                {/* Post Excerpt */}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.content ? `${post.content.substring(0, 150)}...` : 'No content available'}
                </p>
                
                {/* Post Meta */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                  {post.category?.name && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {post.category.name}
                    </span>
                  )}
                  <span>
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown date'}
                  </span>
                </div>
                
                {/* Post Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostList;