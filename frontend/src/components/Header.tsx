import { useState } from 'react'
import { useStore } from '../hooks/useStore.js'

export default function Header() {
  const { connectedWallet, connectWallet, disconnectWallet, activePage, setPage } = useStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [bannerVisible, setBannerVisible] = useState(true)

  const handlePeraConnect = async () => {
    setDropdownOpen(false)
    try {
      await connectWallet()
    } catch (e) {
      // Handled in store
    }
  }

  return (
    <div className="w-full flex flex-col font-sans select-none">
      {/* Promo Banner */}
      {bannerVisible && (
        <div className="w-full bg-[#0047ff] text-white text-xs py-2.5 px-6 flex items-center justify-between transition-all select-none">
          <div className="flex-1 text-center font-medium">
            🚀 <strong>AgentPay</strong> is live on Algorand MainNet for the x402 Global Challenge!{' '}
            <a
              href="https://algorand.co/blog/the-x402-global-challenge-is-live-how-to-build-submit-your-entry"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-100 ml-1 font-semibold"
            >
              See challenge guidelines
            </a>
          </div>
          <button
            onClick={() => setBannerVisible(false)}
            className="text-blue-200 hover:text-white hover:bg-white/10 rounded p-0.5 ml-2 transition-all"
            aria-label="Close banner"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <header className="border-b border-[#eaeaea] sticky top-0 z-50 bg-[#fafafa]/80 backdrop-blur-md h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          
          {/* Left Logo & Brand */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => setPage('home')}
              className="flex items-center gap-2 group hover:opacity-90 transition-opacity"
            >
              {/* Alephant stylized logo placeholder */}
              <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
              <span className="font-bold text-base text-[#111] tracking-tight">AgentPay</span>
            </button>

            {/* Search Input Box */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white border border-[#eaeaea] rounded-full text-slate-400 max-w-[200px] select-none hover:border-[#d9d9d9] transition-all cursor-pointer">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-[11px] font-medium text-[#666]">Search</span>
              <kbd className="px-1 py-0.5 text-[9px] bg-[#f5f5f5] border border-[#d9d9d9] rounded text-[#666] ml-auto font-mono">⌘ K</kbd>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-0.5">
            <button
              onClick={() => setPage('home')}
              className={`v5-tab ${activePage === 'home' ? 'active' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => setPage('console')}
              className={`v5-tab ${activePage === 'console' ? 'active' : ''}`}
            >
              Console
            </button>
            <button
              onClick={() => setPage('models')}
              className={`v5-tab ${activePage === 'models' ? 'active' : ''}`}
            >
              Models
            </button>
            <button
              onClick={() => setPage('chat')}
              className={`v5-tab ${activePage === 'chat' ? 'active' : ''}`}
            >
              Chat
            </button>
            <button
              onClick={() => setPage('rankings')}
              className={`v5-tab ${activePage === 'rankings' ? 'active' : ''}`}
            >
              Rankings
            </button>
            <button
              onClick={() => setPage('pricing')}
              className={`v5-tab ${activePage === 'pricing' ? 'active' : ''}`}
            >
              Pricing
            </button>
            <button
              onClick={() => setPage('docs')}
              className={`v5-tab ${activePage === 'docs' ? 'active' : ''}`}
            >
              Docs
            </button>
          </nav>

          {/* Right Connect Wallet button */}
          <div className="flex items-center gap-3 relative">
            {connectedWallet ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#333] bg-white border border-[#eaeaea] px-3.5 py-1.5 rounded-full font-mono font-medium">
                  {connectedWallet.address.substring(0, 10)}...{connectedWallet.address.slice(-4)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="v5-btn v5-btn-danger v5-btn-sm rounded-full text-xs"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="v5-btn v5-btn-primary rounded-full text-xs flex items-center gap-1.5"
                >
                  Connect Wallet
                  <svg className={`w-3.5 h-3.5 transition-all ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Options */}
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 v5-popover z-50 animate-fade-in font-sans">
                      <button
                        onClick={handlePeraConnect}
                        className="w-full text-left v5-popover-item text-xs text-[#111] hover:bg-[#f5f5f5] rounded flex items-center gap-2 transition-all font-medium"
                      >
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                        Pera Wallet (Algorand)
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </header>
    </div>
  )
}
