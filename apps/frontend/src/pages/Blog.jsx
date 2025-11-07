import React from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'

const Blog = () => {
  const navigate = useNavigate()

  const blogPosts = [
    {
      id: 1,
      title: 'How AI is Reshaping Software Development in 2025',
      metaDescription: 'AI-powered tools are transforming the way software is built — from code generation to smart debugging. Here\'s how AI accelerates development at Mastersolis Infotech.',
      summary: 'AI-assisted coding and automation have revolutionized modern development. Discover how Mastersolis Infotech integrates intelligent systems to make software faster, smarter, and more reliable.',
      tags: ['AI', 'Software Development', 'Automation', 'Innovation', 'Productivity'],
      dateOfPost: 'November 7, 2025',
      postedBy: 'Mastersolis Content Team',
      category: 'AI',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      body: `Introduction

Artificial Intelligence isn't just a trend anymore — it's the backbone of modern software engineering. At Mastersolis Infotech, we leverage AI to make development faster, cleaner, and more adaptable than ever before.

1️⃣ AI in Code Generation

AI-assisted tools such as GitHub Copilot and AWS CodeWhisperer are redefining coding efficiency. They generate boilerplate code, suggest optimal structures, and help developers focus on solving business problems rather than syntax errors.

2️⃣ Smart Debugging and Error Prediction

Traditional debugging is reactive; AI makes it proactive. Machine learning models predict potential bugs and security vulnerabilities before deployment. Mastersolis Infotech integrates intelligent testing pipelines to ensure stability and reliability.

3️⃣ Continuous Learning Systems

Every project teaches the system something new. Our AI models learn from historical commits and deployment logs, improving accuracy and reducing regression errors over time.

4️⃣ Business Impact

By using AI-driven development environments, productivity increases up to 40%, and release cycles shrink. Teams can deliver complex systems in record time while maintaining code quality.

Conclusion

At Mastersolis Infotech, AI isn't replacing developers — it's empowering them. Together, human creativity and machine intelligence are shaping a smarter digital future.

→ Learn more at Mastersolis Infotech.`
    },
    {
      id: 2,
      title: 'The Power of Automation in Full-Stack Development',
      metaDescription: 'Automation bridges efficiency and innovation. See how Mastersolis Infotech accelerates full-stack development with CI/CD, AI tools, and smart workflows.',
      summary: 'From build pipelines to intelligent deployments, automation is revolutionizing software workflows. Mastersolis Infotech uses automation to build scalable, reliable systems faster than ever.',
      tags: ['Full Stack', 'Automation', 'CI/CD', 'DevOps', 'AI Tools'],
      dateOfPost: 'November 7, 2025',
      postedBy: 'Mastersolis Content Team',
      category: 'Automation',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80',
      body: `Introduction

Automation is the silent engineer that never sleeps. It handles repetitive tasks, ensures quality, and lets developers focus on innovation. Mastersolis Infotech integrates automation into every stage of the development cycle.

1️⃣ Continuous Integration and Deployment (CI/CD)

Our pipelines automate testing, linting, and deployment, ensuring every commit is verified within minutes. This reduces manual intervention and keeps production stable.

2️⃣ AI-Powered Monitoring

Post-deployment, our AI-based monitoring systems detect anomalies and performance issues instantly. Automated alerts notify developers long before users notice a problem.

3️⃣ Database and API Automation

Dynamic migrations, schema validations, and API testing are handled through smart scripts, cutting development time by nearly 30%.

4️⃣ Real-Time Collaboration

Automation extends beyond code — it enables synchronized teamwork. Automated notifications keep designers, backend developers, and testers in the loop without extra meetings.

Conclusion

Automation doesn't replace effort — it amplifies it. At Mastersolis Infotech, our mission is to build intelligent systems that work for humans, not against them.

→ Learn more at Mastersolis Infotech.`
    },
    {
      id: 3,
      title: 'Bringing Human Touch to AI Resume Screening',
      metaDescription: 'Mastersolis Infotech uses hybrid AI resume screening to speed hiring while preserving human insight — the balance between automation and empathy.',
      summary: 'AI in recruitment accelerates resume screening but doesn't replace human judgment. Mastersolis Infotech blends AI and empathy to make hiring faster and fairer.',
      tags: ['AI', 'Recruitment', 'HR Tech', 'Resume Screening', 'Automation'],
      dateOfPost: 'November 7, 2025',
      postedBy: 'Mastersolis Content Team',
      category: 'AI',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      body: `Introduction

Recruitment is evolving rapidly. With thousands of applicants per role, HR teams rely on AI to pre-screen resumes — but Mastersolis Infotech believes that technology should assist people, not replace them.

1️⃣ What Hybrid AI Resume Screening Means

Our platform uses NLP-based extraction to read resumes, identify skills, and rank applicants. Recruiters still review top results, ensuring fairness and context.

2️⃣ AI that Explains Its Decisions

Transparency builds trust. Our model highlights why each candidate scored a certain way — based on skills, experience, or project relevance — giving recruiters control and clarity.

3️⃣ Real Results

Companies using our system reduced screening time by 60% while improving candidate quality. Recruiters report higher satisfaction because they spend time with the right people, not piles of data.

Conclusion

AI brings speed, humans bring sense. Together, they redefine smart hiring.

→ Learn more at Mastersolis Infotech.`
    },
    {
      id: 4,
      title: 'Deep Learning for Business Automation: Smarter Decisions, Faster Results',
      metaDescription: 'Mastersolis Infotech leverages deep learning to automate workflows, predict outcomes, and make business processes faster, smarter, and data-driven.',
      summary: 'From forecasting to workflow optimization, deep learning is transforming business automation. Mastersolis Infotech builds AI-driven systems that think, learn, and improve with every decision.',
      tags: ['Deep Learning', 'Business Automation', 'AI', 'Machine Learning', 'Predictive Analytics'],
      dateOfPost: 'November 7, 2025',
      postedBy: 'Mastersolis Content Team',
      category: 'Deep Learning',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      body: `Introduction

The business world no longer runs on instinct alone — it runs on intelligence. Deep learning allows companies to process massive data, predict outcomes, and automate decisions in real time. At Mastersolis Infotech, we harness these capabilities to make organizations future-ready.

1️⃣ The Role of Deep Learning in Automation

Deep learning models excel at pattern recognition. Whether it's predicting customer churn, optimizing inventory, or automating document processing, our neural networks analyze data faster and more accurately than any manual process.

2️⃣ Predictive Decision-Making

Imagine knowing what your customer wants before they ask. Deep learning models trained on behavioral data enable businesses to anticipate needs and personalize solutions. Our systems integrate predictive analytics into CRMs and ERP tools for smarter workflows.

3️⃣ Real-Time Workflow Optimization

Through sensor data and logs, AI learns process inefficiencies and automatically suggests improvements — from logistics routes to energy consumption. Mastersolis Infotech implements adaptive systems that learn continuously, reducing costs and delays.

4️⃣ Case Study: Smarter Retail Forecasting

A retail partner used our deep learning-based model to forecast demand across regions. The result: 27% reduction in overstock and 18% faster fulfillment. The system self-adjusts predictions weekly based on new trends.

Conclusion

Deep learning isn't just about automation — it's about evolution. Businesses powered by data can think ahead, not just react.

→ Learn more at Mastersolis Infotech.`
    },
    {
      id: 5,
      title: 'AI in Web Security: Defending Digital Frontiers with Intelligence',
      metaDescription: 'Mastersolis Infotech combines AI and cybersecurity to detect threats faster, strengthen defenses, and secure digital systems proactively.',
      summary: 'Cyber threats evolve faster than humans can react. Mastersolis Infotech uses AI-powered anomaly detection and predictive analytics to safeguard applications and infrastructure in real time.',
      tags: ['AI Security', 'Cybersecurity', 'Automation', 'Web Protection', 'Threat Detection'],
      dateOfPost: 'November 7, 2025',
      postedBy: 'Mastersolis Content Team',
      category: 'Security',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      body: `Introduction

In 2025, cybersecurity is no longer optional — it's the backbone of trust. As digital platforms expand, threats become more complex. Mastersolis Infotech employs AI-driven security frameworks that adapt, learn, and neutralize attacks before they cause damage.

1️⃣ How AI Reinvents Cyber Defense

Traditional security systems rely on static rules. AI systems, however, learn from traffic patterns, recognize anomalies, and stop zero-day threats that no rulebook can predict.

2️⃣ Anomaly Detection in Action

Our security module monitors every request across web applications and APIs. If a request behaves unusually — like abnormal data payloads or login spikes — the system flags it instantly and notifies administrators in real time.

3️⃣ Predicting Future Attacks

With deep neural networks trained on past incident data, our models forecast potential breaches and vulnerabilities. This proactive defense strategy reduces risk exposure and hardens infrastructure against unknown exploits.

4️⃣ Securing the Human Element

Phishing remains one of the biggest attack vectors. AI tools analyze communication patterns to detect fake emails, helping employees avoid mistakes before they happen.

Conclusion

Cybersecurity powered by AI is not just protection — it's prevention. Mastersolis Infotech builds digital confidence by combining automation, analytics, and intelligence.

→ Learn more at Mastersolis Infotech.`
    }
  ]

  const categories = ['All', 'AI', 'Automation', 'Deep Learning', 'Security', 'Recruitment']

  const featuredPost = blogPosts[0]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">Mastersolis Infotech</h1>
                <p className="text-sm text-gray-500">Human Resource Management System</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Mastersolis Infotech Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay informed with the latest trends in AI, automation, full-stack development, deep learning, and digital transformation. 
              Discover how Mastersolis Infotech is shaping the future of technology.
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === 'All'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Featured Post */}
          <div className="mb-16">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center mb-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {featuredPost.category}
                    </span>
                    <span className="text-gray-500 text-sm ml-4">{featuredPost.readTime}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {featuredPost.summary}
                  </p>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">
                      ⌚ {featuredPost.dateOfPost} • 🔥 {featuredPost.postedBy}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {featuredPost.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button 
                      onClick={() => navigate(`/blog/${featuredPost.id}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Read More →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {blogPosts.slice(1).map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate(`/blog/${post.id}`)}>
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-gray-500 text-xs ml-3">{post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.summary}
                  </p>
                  <div className="mb-4">
                    <p className="text-xs text-gray-500">
                      ⌚ {post.dateOfPost} • 🔥 {post.postedBy}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/blog/${post.id}`)
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Read →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Newsletter Signup */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">
              Stay Updated
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter and get the latest HR insights, product updates, and industry news delivered to your inbox.
            </p>
            <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Blog
