import React from "react"

interface StatsCardProps {
  title: string
  value: number
  icon?: React.ReactNode
  color?: string
  isMoney?: boolean
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color = "blue", isMoney = false }) => {
  // Map color names to Tailwind classes
  const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    blue: { bg: "bg-blue-900/20", text: "text-blue-400", iconBg: "bg-blue-900/30" },
    green: { bg: "bg-green-900/20", text: "text-green-400", iconBg: "bg-green-900/30" },
    red: { bg: "bg-red-900/20", text: "text-red-400", iconBg: "bg-red-900/30" },
    yellow: { bg: "bg-yellow-900/20", text: "text-yellow-400", iconBg: "bg-yellow-900/30" },
    purple: { bg: "bg-purple-900/20", text: "text-purple-400", iconBg: "bg-purple-900/30" },
    indigo: { bg: "bg-indigo-900/20", text: "text-indigo-400", iconBg: "bg-indigo-900/30" },
    orange: { bg: "bg-orange-900/20", text: "text-orange-400", iconBg: "bg-orange-900/30" },
  }

  const { bg, text, iconBg } = colorMap[color] || colorMap.blue

  const formattedValue = isMoney ? `৳${value.toLocaleString()}` : value.toLocaleString()

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col">
      <div className="flex items-center mb-2">
        {icon && (
          <div className={`${iconBg} p-2 rounded-lg mr-2`}>
            {React.cloneElement(icon as React.ReactElement, { className: `h-5 w-5 ${text}` })}
          </div>
        )}
        <span className="text-gray-400 text-sm">{title}</span>
      </div>
      <div className="text-2xl font-bold text-white">{formattedValue}</div>
    </div>
  )
}

export default StatsCard
