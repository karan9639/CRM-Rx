import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export function MiniChart({ data, type = "line", className = "" }) {
  if (!data || data.length === 0) {
    return (
      <div className={`h-16 flex items-center justify-center text-muted-foreground ${className}`}>
        <Minus className="h-4 w-4" />
      </div>
    )
  }

  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  // Calculate trend
  const firstValue = values[0]
  const lastValue = values[values.length - 1]
  const trend = lastValue > firstValue ? "up" : lastValue < firstValue ? "down" : "flat"

  if (type === "bar") {
    return (
      <div className={`flex items-end justify-between h-16 gap-1 ${className}`}>
        {values.map((value, index) => {
          const height = ((value - min) / range) * 100
          return (
            <div
              key={index}
              className="bg-primary/20 rounded-sm flex-1 min-h-[4px]"
              style={{ height: `${Math.max(height, 6)}%` }}
            />
          )
        })}
      </div>
    )
  }

  // Line chart (SVG)
  const width = 120
  const height = 40
  const padding = 4

  const points = values
    .map((value, index) => {
      const x = padding + (index / (values.length - 1)) * (width - 2 * padding)
      const y = padding + (1 - (value - min) / range) * (height - 2 * padding)
      return `${x},${y}`
    })
    .join(" ")

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={width} height={height} className="text-primary">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {values.map((value, index) => {
          const x = padding + (index / (values.length - 1)) * (width - 2 * padding)
          const y = padding + (1 - (value - min) / range) * (height - 2 * padding)
          return <circle key={index} cx={x} cy={y} r="2" fill="currentColor" />
        })}
      </svg>

      <div className="flex items-center">
        {trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
        {trend === "down" && <TrendingDown className="h-4 w-4 text-red-500" />}
        {trend === "flat" && <Minus className="h-4 w-4 text-gray-500" />}
      </div>
    </div>
  )
}

export function ProgressChart({ value, max = 100, className = "" }) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span>{value}</span>
        <span className="text-muted-foreground">{max}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
      </div>
      <div className="text-xs text-muted-foreground text-center">{percentage.toFixed(1)}% complete</div>
    </div>
  )
}
