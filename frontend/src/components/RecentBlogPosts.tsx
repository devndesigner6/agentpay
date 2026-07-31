export default function RecentBlogPosts() {
  const posts = [
    {
      title: 'Using OpenRouter With LangChain: ChatOpenRouter Setup Guide',
      excerpt: 'The LangChain integration now has a dedicated package: langchain-openrouter on PyPI and @langchain/openrouter on npm. Most guides still teach the old ChatOpenAI base_url override. This is the current path, plus the routing economics context.',
      date: 'July 29, 2026',
      badge: 'New',
      iconColor: 'from-purple-500 to-indigo-500',
      iconSvg: (
        <svg className="w-10 h-10 text-purple-400 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a2 2 0 002 2h3a1 1 0 011 1v3a2 2 0 002 2 2 2 0 010 4 2 2 0 00-2 2v3a1 1 0 01-1 1h-3a2 2 0 00-2 2 2 2 0 01-4 0 2 2 0 00-2-2H7a1 1 0 01-1-1v-3a2 2 0 00-2-2 2 2 0 010-4 2 2 0 002-2V7a1 1 0 011-1h3a2 2 0 002-2z" />
        </svg>
      )
    },
    {
      title: 'How to Evaluate LLM Provider Performance Across Latency, Throughput, and Uptime',
      excerpt: "The same model behaves differently across provider endpoints. Infrastructure, quantization, load handling, and routing defaults all change the result. Here's how to measure latency, throughput, uptime, and precision, then turn the measurements into a routing policy.",
      date: 'July 28, 2026',
      badge: 'New',
      iconColor: 'from-fuchsia-500 to-purple-500',
      iconSvg: (
        <svg className="w-10 h-10 text-fuchsia-400 filter drop-shadow-[0_0_8px_rgba(240,82,244,0.4)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      title: 'Image Generation Models on OpenRouter',
      excerpt: "Generation runs through the dedicated /api/v1/images endpoint and understanding through /chat/completions, with the same key and billing. Here's the full contract for both jobs, plus the fix for the 'no endpoints found' error.",
      date: 'July 27, 2026',
      badge: 'New',
      iconColor: 'from-violet-500 to-indigo-500',
      iconSvg: (
        <svg className="w-10 h-10 text-violet-400 filter drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ]

  return (
    <section className="py-16 bg-brand-black border-t border-brand-border select-none">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-lg font-bold text-white font-sans">
            Recent Blog Posts
          </h2>
          <a href="#blog" className="text-xs text-gray-400 hover:text-white flex items-center gap-1 font-sans transition-all">
            View all
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>

        {/* Posts List */}
        <div className="space-y-10">
          {posts.map((post, i) => (
            <div key={i} className="flex gap-6 items-start group cursor-pointer">
              {/* Graphic Icon */}
              <div className={`w-20 h-20 bg-gradient-to-br ${post.iconColor} bg-opacity-10 border border-brand-border rounded-xl flex items-center justify-center flex-shrink-0 group-hover:border-zinc-700 transition-all shadow-md`}>
                {post.iconSvg}
              </div>

              {/* Text info */}
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-100 group-hover:text-white transition-colors font-sans mb-1.5 leading-snug">
                  {post.title}
                </h3>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed mb-2.5">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 font-sans font-medium">{post.date}</span>
                  {post.badge && (
                    <span className="text-[8px] tracking-wide text-blue-400 bg-blue-950/30 border border-blue-900/40 font-bold px-1.5 py-0.5 rounded uppercase">
                      {post.badge}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
