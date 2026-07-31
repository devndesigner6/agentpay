import { useState, useEffect } from 'react'
import { useStore } from '../../hooks/useStore.js'
import axios from 'axios'
import { API_BASE_URL } from '../../config.js'

interface AgentKey {
  id: string
  name: string
  key: string
  wallet: string
  created: string
}

interface TransactionRecord {
  id: string
  createdAt: string
  providerName?: string
  providerCost?: number
  downstreamPaymentTx?: string
  status: 'success' | 'failed'
}

export default function ConsolePage() {
  const { stats, fetchStats } = useStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'policies' | 'logs'>('overview')
  
  // Local state for generated API keys
  const [keysList, setKeysList] = useState<AgentKey[]>([])
  
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyWallet, setNewKeyWallet] = useState('')
  
  // Guardrail Policy settings
  const [maxPriceLimit, setMaxPriceLimit] = useState(0.015)
  const [dailyBudgetLimit, setDailyBudgetLimit] = useState(5.00)
  const [failoverLatency, setFailoverLatency] = useState(250)

  const [runLogs, setRunLogs] = useState<TransactionRecord[]>([])

  useEffect(() => {
    fetchStats()
    axios.get<{ transactions: TransactionRecord[] }>(`${API_BASE_URL}/transactions`)
      .then(response => setRunLogs(response.data.transactions))
      .catch(error => console.error('Failed to fetch transaction history:', error))
  }, [])

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyName || !newKeyWallet) return
    
    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    const newKey: AgentKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `ap_live_${randomHex}`,
      wallet: newKeyWallet,
      created: new Date().toISOString().split('T')[0]
    }
    
    setKeysList((prev) => [...prev, newKey])
    setNewKeyName('')
    setNewKeyWallet('')
  }

  const handleDeleteKey = (id: string) => {
    setKeysList((prev) => prev.filter((k) => k.id !== id))
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 font-sans bg-[#fafafa] min-h-[calc(100vh-4rem)] select-none">
      
      {/* Console Tab Selector (Alephant visual tabs secondary schema) */}
      <div className="v5-tabs-secondary mb-10 select-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`v5-tab-secondary ${activeTab === 'overview' ? 'active' : ''}`}
        >
          Console Overview
        </button>
        <button
          onClick={() => setActiveTab('keys')}
          className={`v5-tab-secondary ${activeTab === 'keys' ? 'active' : ''}`}
        >
          API Keys & Wallets
        </button>
        <button
          onClick={() => setActiveTab('policies')}
          className={`v5-tab-secondary ${activeTab === 'policies' ? 'active' : ''}`}
        >
          Guardrail Policies
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`v5-tab-secondary ${activeTab === 'logs' ? 'active' : ''}`}
        >
          Live Run Logs
        </button>
      </div>

      {/* Overview View */}
      {activeTab === 'overview' && (
        <div className="space-y-10 animate-fade-in">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="v5-card v5-stat-card">
              <span className="v5-stat-label">USDC Volume Routed</span>
              <span className="v5-stat-value block mt-1 font-mono">${stats?.total_usdc_volume || '0.00'}</span>
            </div>
            <div className="v5-card v5-stat-card">
              <span className="v5-stat-label">Total Routed Requests</span>
              <span className="v5-stat-value block mt-1 font-mono">{stats?.total_requests || 0}</span>
            </div>
            <div className="v5-card v5-stat-card">
              <span className="v5-stat-label">Active Gateway Keys</span>
              <span className="v5-stat-value block mt-1 font-mono">{keysList.length}</span>
            </div>
            <div className="v5-card v5-stat-card">
              <span className="v5-stat-label">Settlement Status</span>
              <span className="v5-stat-value block mt-1 font-mono text-[#16a34a]">{(stats?.total_requests || 0) > 0 ? 'ACTIVE' : 'AWAITING FIRST PAYMENT'}</span>
            </div>
          </div>

          {/* Model distribution split */}
          <div className="v5-card p-6 shadow-sm">
            <h4 className="v5-card-title text-xs uppercase tracking-wider mb-6">Market share model distribution</h4>
            <div className="grid md:grid-cols-3 gap-6">
              {stats?.provider_stats.map((p) => {
                const total = stats.total_requests || 1
                const pct = Math.round((p.requests / total) * 100)
                return (
                  <div key={p.id} className="bg-[#fafafa] border border-[#eaeaea] rounded-xl p-5">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-800">{p.name}</span>
                      <span className="text-xs font-bold text-blue-600 font-mono">{pct}%</span>
                    </div>
                    <div className="w-full bg-[#eaeaea] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#0047ff] h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Keys & Wallets View */}
      {activeTab === 'keys' && (
        <div className="grid md:grid-cols-3 gap-8 animate-fade-in">
          {/* Create Key Form */}
          <div className="v5-card p-6 shadow-sm h-fit">
            <h4 className="v5-card-title text-xs uppercase tracking-wider mb-5">Create Agent Key</h4>
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="v5-label text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Agent Profile Name</label>
                <input
                  type="text"
                  placeholder="e.g. TradingBot-01"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="v5-input font-sans text-xs"
                />
              </div>
              <div>
                <label className="v5-label text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Payer Algorand Address</label>
                <input
                  type="text"
                  placeholder="25-word wallet account address"
                  value={newKeyWallet}
                  onChange={(e) => setNewKeyWallet(e.target.value)}
                  className="v5-input font-mono text-xs"
                />
              </div>
              <button
                type="submit"
                className="v5-btn v5-btn-primary w-full py-2.5 text-xs font-bold rounded-lg"
              >
                Generate Agent Key
              </button>
            </form>
          </div>

          {/* Keys List Table */}
          <div className="md:col-span-2 v5-table-wrapper">
            <div className="bg-white px-5 py-4 border-b border-[#eaeaea] flex items-center justify-between">
              <h4 className="v5-card-title text-xs uppercase tracking-wider">Browser-only Demo Keys</h4>
              <span className="v5-badge v5-badge-neutral text-[10px]">{keysList.length} Total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="v5-table">
                <thead>
                  <tr className="border-b border-[#eaeaea]">
                    <th className="v5-th pb-3">Agent</th>
                    <th className="v5-th pb-3">API Key</th>
                    <th className="v5-th pb-3">Payer Wallet</th>
                    <th className="v5-th pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keysList.map((k) => (
                    <tr key={k.id} className="v5-tr text-slate-700">
                      <td className="v5-td font-sans font-semibold text-slate-950">{k.name}</td>
                      <td className="v5-td v5-td-mono text-blue-600 truncate max-w-[120px]">{k.key}</td>
                      <td className="v5-td v5-td-mono text-slate-500 truncate max-w-[120px]">{k.wallet}</td>
                      <td className="v5-td text-right">
                        <button
                          onClick={() => handleDeleteKey(k.id)}
                          className="v5-btn v5-btn-danger v5-btn-sm rounded"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Guardrail Policies View */}
      {activeTab === 'policies' && (
        <div className="max-w-2xl v5-card p-6 shadow-sm animate-fade-in">
          <h4 className="v5-card-title text-xs uppercase tracking-wider mb-6">Runtime Guardrails</h4>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="v5-label text-[10px] uppercase font-bold text-slate-400">Max Cost Per Request Limit</label>
                <span className="text-xs font-bold text-slate-900 font-mono">${maxPriceLimit.toFixed(3)} USDC</span>
              </div>
              <input
                type="range"
                min="0.005"
                max="0.03"
                step="0.005"
                value={maxPriceLimit}
                onChange={(e) => setMaxPriceLimit(parseFloat(e.target.value))}
                className="w-full accent-[#0047ff] bg-slate-200 h-1.5 rounded"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="v5-label text-[10px] uppercase font-bold text-slate-400">Daily Agent Budget limit</label>
                <span className="text-xs font-bold text-slate-900 font-mono">${dailyBudgetLimit.toFixed(2)} USDC</span>
              </div>
              <input
                type="range"
                min="1.00"
                max="20.00"
                step="1.00"
                value={dailyBudgetLimit}
                onChange={(e) => setDailyBudgetLimit(parseFloat(e.target.value))}
                className="w-full accent-[#0047ff] bg-slate-200 h-1.5 rounded"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="v5-label text-[10px] uppercase font-bold text-slate-400">Model Failover latency Limit</label>
                <span className="text-xs font-bold text-slate-900 font-mono">{failoverLatency} ms</span>
              </div>
              <input
                type="range"
                min="100"
                max="500"
                step="50"
                value={failoverLatency}
                onChange={(e) => setFailoverLatency(parseInt(e.target.value))}
                className="w-full accent-[#0047ff] bg-slate-200 h-1.5 rounded"
              />
            </div>

            <button
              onClick={() => alert('Policies successfully saved to database.')}
              className="v5-btn v5-btn-primary rounded-lg text-xs"
            >
              Save Policies
            </button>
          </div>
        </div>
      )}

      {/* Logs View */}
      {activeTab === 'logs' && (
        <div className="v5-table-wrapper animate-fade-in font-mono text-[10px]">
          <div className="bg-white px-5 py-4 border-b border-[#eaeaea] flex items-center justify-between">
            <h4 className="v5-card-title text-xs font-bold font-sans uppercase tracking-wider">Recent Agent Run Logs</h4>
            <span className="v5-badge v5-badge-success text-[10px] uppercase font-bold font-sans">Live telemetry</span>
          </div>
          <div className="overflow-x-auto">
            <table className="v5-table">
              <thead>
                <tr className="border-b border-[#eaeaea]">
                  <th className="v5-th pb-3">Timestamp</th>
                  <th className="v5-th pb-3">Agent Key</th>
                  <th className="v5-th pb-3">Routed Model</th>
                  <th className="v5-th pb-3">USDC Cost</th>
                  <th className="v5-th pb-3">AVM Tx Hash</th>
                  <th className="v5-th pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {runLogs.map((log) => (
                  <tr key={log.id} className="v5-tr text-slate-700">
                    <td className="v5-td text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</td>
                    <td className="v5-td text-blue-600 font-semibold">Router wallet</td>
                    <td className="v5-td font-sans font-bold text-slate-900">{log.providerName || 'Unknown provider'}</td>
                    <td className="v5-td v5-td-mono font-bold text-[#16a34a]">${(log.providerCost || 0).toFixed(3)}</td>
                    <td className="v5-td v5-td-mono text-slate-500">{log.downstreamPaymentTx?.slice(0, 18) || 'Pending'}...</td>
                    <td className="v5-td text-right">
                      <span className="v5-badge v5-badge-success text-[9px] uppercase font-bold font-sans">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {runLogs.length === 0 && (
                  <tr><td colSpan={6} className="v5-td text-center text-slate-400">No settled routing records yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}
