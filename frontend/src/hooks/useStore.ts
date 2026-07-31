import { create } from 'zustand'
import axios from 'axios'
import { PeraWalletConnect } from '@perawallet/connect'
import { API_BASE_URL, PERA_CHAIN_ID } from '../config.js'

interface Wallet {
  address: string
}

interface ProviderStat {
  id: string
  name: string
  requests: number
  avg_latency: number
  availability: number
  total_revenue: string
}

interface StatsData {
  total_requests: number
  total_usdc_volume: string
  routing_distribution: Record<string, number>
  provider_stats: ProviderStat[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  provider?: string
  latency?: number
  txHash?: string
}

interface StoreState {
  connectedWallet: Wallet | null
  stats: StatsData | null
  isLoadingStats: boolean
  peraWallet: PeraWalletConnect
  activePage: 'home' | 'console' | 'models' | 'chat' | 'rankings' | 'pricing' | 'docs'
  chatModel: string
  chatMessages: ChatMessage[]
  
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  reconnectWallet: () => Promise<void>
  fetchStats: () => Promise<void>
  setPage: (page: 'home' | 'console' | 'models' | 'chat' | 'rankings' | 'pricing' | 'docs') => void
  setChatModel: (model: string) => void
  addChatMessage: (msg: ChatMessage) => void
  clearChat: () => void
}

const peraWalletInstance = new PeraWalletConnect({
  chainId: PERA_CHAIN_ID,
  shouldShowSignTxnToast: true
})

export const useStore = create<StoreState>((set) => ({
  connectedWallet: null,
  stats: null,
  isLoadingStats: false,
  peraWallet: peraWalletInstance,
  activePage: 'home',
  chatModel: 'cheapest',
  chatMessages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome to the AgentPay Chat Playground. Select a model preference from the header dropdown above. Every prompt request requires a $0.03 USDC x402 payment, which is automatically routed to the cheapest, fastest, or most reliable provider. Try sending a message!'
    }
  ],

  connectWallet: async () => {
    try {
      const accounts = await peraWalletInstance.connect()
      
      peraWalletInstance.connector?.on('disconnect', () => {
        set({ connectedWallet: null })
      })

      if (accounts.length > 0) {
        set({
          connectedWallet: {
            address: accounts[0]
          }
        })
      }
    } catch (error: any) {
      if (error?.data?.type !== 'CONNECT_MODAL_CLOSED') {
        console.error('Pera Wallet connection error:', error)
      }
      throw error
    }
  },

  disconnectWallet: () => {
    peraWalletInstance.disconnect().catch(console.error)
    set({ connectedWallet: null })
  },

  reconnectWallet: async () => {
    try {
      const accounts = await peraWalletInstance.reconnectSession()
      
      if (accounts.length > 0) {
        peraWalletInstance.connector?.on('disconnect', () => {
          set({ connectedWallet: null })
        })

        set({
          connectedWallet: {
            address: accounts[0]
          }
        })
      }
    } catch (error) {
      console.error('Pera Wallet reconnect session error:', error)
    }
  },

  fetchStats: async () => {
    set({ isLoadingStats: true })
    try {
      const response = await axios.get<StatsData>(`${API_BASE_URL}/stats`)
      set({ stats: response.data, isLoadingStats: false })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      set({ isLoadingStats: false })
    }
  },

  setPage: (page) => {
    set({ activePage: page })
    // Scroll window back to top when switching tabs
    window.scrollTo({ top: 0, behavior: 'instant' })
  },

  setChatModel: (model) => {
    set({ chatModel: model })
  },

  addChatMessage: (msg) => {
    set((state) => ({ chatMessages: [...state.chatMessages, msg] }))
  },

  clearChat: () => {
    set({
      chatMessages: [
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Welcome to the AgentPay Chat Playground. Select a model preference from the header dropdown above. Every prompt request requires a $0.03 USDC x402 payment, which is automatically routed to the cheapest, fastest, or most reliable provider. Try sending a message!'
        }
      ]
    })
  }
}))
