import { useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Footer from './components/Footer'

// Subpages
import ConsolePage from './components/pages/ConsolePage.js'
import ModelsPage from './components/pages/ModelsPage.js'
import ChatPage from './components/pages/ChatPage.js'
import RankingsPage from './components/pages/RankingsPage.js'
import PricingPage from './components/pages/PricingPage.js'
import DocsPage from './components/pages/DocsPage.js'

import { useStore } from './hooks/useStore.js'

function App() {
  const { reconnectWallet, activePage } = useStore()
  const isWorkspace = activePage === 'console'

  useEffect(() => {
    reconnectWallet()
  }, [reconnectWallet])

  return (
    <div className={`min-h-screen theme-v5 text-[#111] font-sans ${isWorkspace ? 'bg-white' : 'landing-page bg-[#fafafa]'}`}>
      {!isWorkspace && <Header />}
      <main>
        {activePage === 'home' && (
          <>
            <Hero />
            <HowItWorks />
          </>
        )}
        {activePage === 'console' && <ConsolePage />}
        {activePage === 'models' && <ModelsPage />}
        {activePage === 'chat' && <ChatPage />}
        {activePage === 'rankings' && <RankingsPage />}
        {activePage === 'pricing' && <PricingPage />}
        {activePage === 'docs' && <DocsPage />}
      </main>
      {!isWorkspace && <Footer />}
    </div>
  )
}

export default App
