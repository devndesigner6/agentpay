import { useStore } from '../hooks/useStore.js'

const links = [
  ['x402 on Algorand', 'https://dev.algorand.co/resources/x402-on-algorand/'],
  ['Algorand x402', 'https://algorand.co/agentic-commerce/x402'],
  ['Agentic commerce', 'https://algorand.co/blog/x402-unlocking-the-agentic-commerce-era'],
  ['x402 Global Challenge', 'https://algorand.co/blog/the-x402-global-challenge-is-live-how-to-build-submit-your-entry'],
  ['Facilitator docs', 'https://facilitator.goplausible.xyz/docs'],
  ['x402 leaderboard', 'https://facilitator.goplausible.xyz/dashboard/leaderboards'],
]

export default function Footer() {
  const { setPage } = useStore()
  return <footer className="bg-[#fafafa] border-t border-[#eaeaea] py-12 text-xs select-none">
    <div className="max-w-6xl mx-auto px-6">
      <button onClick={() => setPage('home')} className="flex items-center gap-2 mb-5"><img src="/Avatar.jpg" className="w-6 h-6 rounded-md"/><span className="font-departure font-bold text-sm">AgentPay</span></button>
      <div className="flex flex-wrap gap-x-6 gap-y-3 border-y border-[#eaeaea] py-5">{links.map(([name,url]) => <a key={url} href={url} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-[#0047ff]">{name} ↗</a>)}</div>
      <p className="pt-5 text-slate-500">Made with ♥ by <a href="https://hemanthme.in" target="_blank" rel="noreferrer" className="text-[#0047ff]">Hemanth</a></p>
    </div>
  </footer>
}
