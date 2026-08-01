import { useState } from 'react'
import { useStore } from '../hooks/useStore.js'
import { NETWORK_LABEL } from '../config.js'

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
        <div className="w-full bg-[#0047ff] text-white text-xs py-2 px-6 flex items-center justify-between transition-all select-none">
          <div className="flex-1 text-center font-medium">
            <strong className="font-departure uppercase text-[9px] tracking-wider bg-white/10 px-1.5 py-0.5 rounded mr-1">AgentPay</strong> is configured for Algorand <span className="font-geist-mono font-bold">{NETWORK_LABEL}</span>. Complete a verified x402 payment before calling it live.
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
      <header className="border-b border-[#eaeaea] sticky top-0 z-50 bg-[#fafafa]/85 backdrop-blur-md h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          
          {/* Left Logo & Brand */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => setPage('home')}
              className="flex items-center gap-2 group hover:opacity-90 transition-opacity"
            >
              {/* AgentPay stylized logo */}
              <svg className="w-6 h-6 text-[#111]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
              <span className="font-bold text-base text-[#111] tracking-tight">AgentPay</span>
            </button>

            {/* Search Input Box */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white border border-[#eaeaea] rounded-lg text-slate-400 max-w-[200px] select-none hover:border-slate-300 transition-all cursor-pointer">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-[11px] font-medium text-[#666]">Search</span>
              <kbd className="px-1 py-0.5 text-[9px] bg-[#fafafa] border border-[#eaeaea] rounded text-[#666] ml-auto font-mono shadow-2xs">⌘ K</kbd>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setPage('home')}
              className={`v5-tab uppercase text-[10px] tracking-wider font-bold ${activePage === 'home' ? 'active' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => setPage('console')}
              className={`v5-tab uppercase text-[10px] tracking-wider font-bold ${activePage === 'console' ? 'active' : ''}`}
            >
              Console
            </button>
            <button
              onClick={() => setPage('models')}
              className={`v5-tab uppercase text-[10px] tracking-wider font-bold ${activePage === 'models' ? 'active' : ''}`}
            >
              Models
            </button>
            <button
              onClick={() => setPage('chat')}
              className={`v5-tab uppercase text-[10px] tracking-wider font-bold ${activePage === 'chat' ? 'active' : ''}`}
            >
              Agents
            </button>
            <button
              onClick={() => setPage('rankings')}
              className={`v5-tab uppercase text-[10px] tracking-wider font-bold ${activePage === 'rankings' ? 'active' : ''}`}
            >
              Rankings
            </button>
            <button
              onClick={() => setPage('pricing')}
              className={`v5-tab uppercase text-[10px] tracking-wider font-bold ${activePage === 'pricing' ? 'active' : ''}`}
            >
              Pricing
            </button>
            <button
              onClick={() => setPage('docs')}
              className={`v5-tab uppercase text-[10px] tracking-wider font-bold ${activePage === 'docs' ? 'active' : ''}`}
            >
              Docs
            </button>
          </nav>

          {/* Right Connect Wallet button */}
          <div className="flex items-center gap-3 relative">
            {connectedWallet ? (
              <div className="flex items-center gap-2 animate-fade-in">
                <span className="text-xs text-[#333] bg-white border border-[#eaeaea] px-3.5 py-1.5 rounded-lg font-geist-mono font-bold shadow-2xs">
                  {connectedWallet.address.substring(0, 10)}...{connectedWallet.address.slice(-4)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="v5-btn v5-btn-danger v5-btn-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="v5-btn v5-btn-primary rounded-lg text-xs flex items-center gap-1.5 font-bold"
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
                        className="w-full text-left v5-popover-item text-xs text-[#111] hover:bg-slate-50 flex items-center gap-2 transition-all font-bold"
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
