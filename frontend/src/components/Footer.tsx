import { useStore } from '../hooks/useStore.js'

export default function Footer() {
  const { setPage } = useStore()

  const footerLinks: Record<string, Array<{ name: string; page?: 'home' | 'models' | 'chat' | 'rankings' | 'pricing' | 'docs'; url?: string; badge?: string }>> = {
    Product: [
      { name: 'Agents', page: 'chat' },
      { name: 'Rankings', page: 'rankings' },
      { name: 'Models', page: 'models' },
      { name: 'Pricing', page: 'pricing' }
    ],
    Company: [
      { name: 'About', url: '#about' },
      { name: 'Blog', url: '#blog' },
      { name: 'Careers', url: '#careers', badge: 'Hiring' },
      { name: 'Privacy', url: '#privacy' },
      { name: 'Terms of Service', url: '#terms' }
    ],
    Developer: [
      { name: 'Documentation', page: 'docs' },
      { name: 'API Reference', page: 'docs' }
    ],
    Connect: [
      { name: 'Discord', url: 'https://discord.gg/agentpay' },
      { name: 'GitHub', url: 'https://github.com/agentpay' },
      { name: 'LinkedIn', url: 'https://linkedin.com/company/agentpay' },
      { name: 'X', url: 'https://x.com/agentpay' }
    ]
  }

  const handleLinkClick = (e: React.MouseEvent, item: any) => {
    if (item.page) {
      e.preventDefault()
      setPage(item.page)
    }
  }

  return (
    <footer className="bg-[#fafafa] border-t border-[#eaeaea] py-16 text-xs select-none font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          {/* Logo Column */}
          <div className="col-span-2 md:col-span-1">
            <button
              onClick={() => setPage('home')}
              className="flex items-center gap-2 mb-4 group hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
              <span className="font-bold text-sm text-[#111]">AgentPay</span>
            </button>
            <p className="text-[10px] text-[#666] font-sans mt-0.5">
              © 2026 AgentPay, Inc
            </p>
          </div>

          {/* Nav Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-bold text-[#111] mb-4 font-sans tracking-wide">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.url || '#'}
                      onClick={(e) => handleLinkClick(e, link)}
                      className="text-[#666] hover:text-[#111] transition-colors font-sans flex items-center gap-1.5"
                    >
                      {link.name}
                      {link.badge && (
                        <span className="v5-badge v5-badge-brand text-[8px] uppercase tracking-wider">
                          {link.badge}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </footer>
  )
}
