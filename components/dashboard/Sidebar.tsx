"use client"

import { LayoutDashboard, TrendingUp, History, Wallet, Settings } from "lucide-react"

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  userAddress: string
}

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  category: "trading" | "account"
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, category: "trading" },
  { id: "markets", label: "Markets", icon: TrendingUp, category: "trading" },
  { id: "positions", label: "Positions", icon: TrendingUp, category: "trading" },
  { id: "history", label: "History", icon: History, category: "trading" },
  { id: "wallet", label: "Wallet", icon: Wallet, category: "account" },
  { id: "settings", label: "Settings", icon: Settings, category: "account" },
]

export function Sidebar({ activeView, onViewChange, userAddress }: SidebarProps) {
  const tradingItems = navItems.filter((item) => item.category === "trading")
  const accountItems = navItems.filter((item) => item.category === "account")

  const truncatedAddress = userAddress
    ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
    : "Not Connected"

  return (
    <aside className="w-64 bg-[#1A1A1F] border-r border-[#2D2D35] flex flex-col">
      {/* Sidebar Content */}
      <div className="flex-1 flex flex-col py-6">
        {/* Trading Section */}
        <div className="mb-6">
          <div className="px-6 mb-2">
            <span className="text-xs font-mono text-[#4A4A55] uppercase tracking-wider">
              Trading
            </span>
          </div>
          <nav className="space-y-1 px-3">
            {tradingItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={activeView === item.id}
                onClick={() => onViewChange(item.id)}
              />
            ))}
          </nav>
        </div>

        {/* Account Section */}
        <div className="mb-6">
          <div className="px-6 mb-2">
            <span className="text-xs font-mono text-[#4A4A55] uppercase tracking-wider">
              Account
            </span>
          </div>
          <nav className="space-y-1 px-3">
            {accountItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={activeView === item.id}
                onClick={() => onViewChange(item.id)}
              />
            ))}
          </nav>
        </div>
      </div>

      {/* User Info at Bottom */}
      <div className="border-t border-[#2D2D35] p-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C45D3E] to-[#8B3E2F] flex items-center justify-center">
            <span className="text-[#F5EDE0] font-bold text-sm">
              {userAddress ? userAddress.slice(2, 4).toUpperCase() : "?"}
            </span>
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#F5EDE0] truncate">hackwy</p>
            <p className="text-xs text-[#4A4A55] font-mono truncate">{truncatedAddress}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

interface NavItemProps {
  item: NavItem
  isActive: boolean
  onClick: () => void
}

function NavItem({ item, isActive, onClick }: NavItemProps) {
  const Icon = item.icon

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2 rounded-lg
        transition-all duration-200 group
        ${
          isActive
            ? "bg-[#C45D3E]/20 text-[#C45D3E] border border-[#C45D3E]/30"
            : "text-[#4A4A55] hover:text-[#F5EDE0] hover:bg-[#2D2D35]/50"
        }
      `}
    >
      <Icon className="w-5 h-5" />
      <span className="font-sans text-sm font-medium">{item.label}</span>
    </button>
  )
}
