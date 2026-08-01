import { motion } from 'motion/react'

export type TabItem = { value: string; label: string }
export function Tabs({ items, value, onValueChange }: { items: TabItem[]; value: string; onValueChange: (value: string) => void }) {
  return <div role="tablist" className="relative flex gap-1 border-b border-[#eaeaea]">
    {items.map(item => { const selected = item.value === value; return <button key={item.value} role="tab" aria-selected={selected} onClick={() => onValueChange(item.value)} className={`relative px-3 py-2 text-xs ${selected ? 'text-[#111] font-semibold' : 'text-slate-500'}`}>
      {selected && <motion.span layoutId="agentpay-tab-indicator" className="absolute inset-x-2 bottom-0 h-0.5 bg-[#0047ff]" transition={{ type: 'spring', stiffness: 620, damping: 42 }} />}{item.label}
    </button> })}
  </div>
}
