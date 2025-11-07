import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import Chatbot from '../components/Chatbot'
import { blogPosts } from '../data/blogPosts'

const BlogDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const post = blogPosts.find(p => p.id === parseInt(id))

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
          <button
            onClick={() => navigate('/blog')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Blog
          </button>
        </div>
      </div>
    )
  }

  // Format body content - split by double newlines and render as paragraphs
  const bodyParagraphs = post.body.split('\n\n').filter(p => p.trim())

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      {/* Main Content */}
      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Blog Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {post.category}
              </span>
              <span className="text-gray-500 text-sm ml-4">{post.readTime}</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>
            <div className="mb-6">
              <p className="text-lg text-gray-600 mb-4">
                {post.summary}
              </p>
              <p className="text-sm text-gray-500">
                ⌚ Posted on {post.dateOfPost} by {post.postedBy}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, idx) => (
                <span key={idx} className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-8">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Blog Body */}
          <article className="prose prose-lg max-w-none mb-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              {bodyParagraphs.map((paragraph, idx) => {
                // Check if paragraph starts with a number emoji (section header)
                const isHeader = /^[0-9]️⃣/.test(paragraph.trim())
                const isConclusion = paragraph.trim().startsWith('Conclusion')
                const isIntroduction = paragraph.trim().startsWith('Introduction')
                
                if (isHeader || isConclusion || isIntroduction) {
                  return (
                    <h2 key={idx} className="text-2xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">
                      {paragraph.trim()}
                    </h2>
                  )
                } else if (paragraph.trim().startsWith('→')) {
                  return (
                    <p key={idx} className="text-lg font-semibold text-blue-600 mt-8 mb-4">
                      {paragraph.trim()}
                    </p>
                  )
                } else {
                  return (
                    <p key={idx} className="text-gray-700 leading-relaxed mb-6">
                      {paragraph.trim()}
                    </p>
                  )
                }
              })}
            </div>
          </article>

          {/* Share Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this article</h3>
            <div className="flex gap-4">
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Twitter
              </button>
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                LinkedIn
              </button>
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Facebook
              </button>
            </div>
          </div>

          {/* Back to Blog */}
          <div className="text-center">
            <button
              onClick={() => navigate('/blog')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to All Posts
            </button>
          </div>
        </div>
      </main>

      <Footer />

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}

export default BlogDetail

