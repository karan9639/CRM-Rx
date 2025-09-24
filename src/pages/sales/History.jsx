"use client"

import { useMemo } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { useDataStore } from "@/store/useDataStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { formatDate, formatTime, formatCurrency } from "@/utils/format"
import { HistoryIcon, Calendar, FileText, MapPin, TrendingUp, DollarSign, Award } from "lucide-react"
import dayjs from "dayjs"

export default function History() {
  const { user } = useAuthStore()
  const { tasks, companies, visitReports } = useDataStore()

  // Get completed tasks with reports
  const completedTasksWithReports = useMemo(() => {
    return tasks
      .filter((task) => task.salespersonId === user?.id && task.status === "completed")
      .map((task) => {
        const company = companies.find((c) => c.id === task.companyId)
        const report = visitReports.find((r) => r.taskId === task.id)
        return {
          ...task,
          company,
          report,
          companyName: company?.name || "",
          cityName: company?.address.city || "",
          contactName: report?.actualContact?.name || "",
          outcome: report?.outcome || "",
          orderValue: report?.orderValue || 0,
          submittedAt: report?.submittedAt || "",
        }
      })
      .filter((task) => task.report) // Only include tasks with reports
      .sort((a, b) => dayjs(b.report.submittedAt).diff(dayjs(a.report.submittedAt)))
  }, [tasks, companies, visitReports, user?.id])

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalVisits = completedTasksWithReports.length
    const totalValue = completedTasksWithReports.reduce((sum, task) => sum + (task.report?.orderValue || 0), 0)
    const wonDeals = completedTasksWithReports.filter((task) => task.report?.outcome === "closed_win").length
    const avgValue = totalVisits > 0 ? totalValue / totalVisits : 0

    return { totalVisits, totalValue, wonDeals, avgValue }
  }, [completedTasksWithReports])

  const getOutcomeLabel = (outcome) => {
    switch (outcome) {
      case "met":
        return "Met"
      case "not_available":
        return "Not Available"
      case "rescheduled":
        return "Rescheduled"
      case "closed_win":
        return "Closed Won"
      case "closed_lost":
        return "Closed Lost"
      case "follow_up":
        return "Follow Up"
      default:
        return outcome
    }
  }

  const getOutcomeVariant = (outcome) => {
    switch (outcome) {
      case "closed_win":
        return "success"
      case "closed_lost":
        return "destructive"
      case "follow_up":
        return "warning"
      case "rescheduled":
        return "warning"
      case "not_available":
        return "outline"
      default:
        return "default"
    }
  }

  const columns = [
    {
      key: "submittedAt",
      header: "Date & Time",
      render: (value, task) => (
        <div>
          <div className="font-medium text-sm">{formatDate(task.report.submittedAt)}</div>
          <div className="text-xs text-muted-foreground">{formatTime(task.report.submittedAt)}</div>
        </div>
      ),
    },
    {
      key: "companyName",
      header: "Company",
      filterable: true,
      render: (value, task) => (
        <div>
          <div className="font-medium text-sm">{task.company?.name}</div>
          <div className="text-xs text-muted-foreground">{task.company?.address.city}</div>
        </div>
      ),
    },
    {
      key: "contactName",
      header: "Contact Met",
      filterable: true,
      render: (value, task) =>
        task.report.actualContact?.name ? (
          <div>
            <div className="font-medium text-sm">{task.report.actualContact.name}</div>
            {task.report.actualContact.role && (
              <div className="text-xs text-muted-foreground">{task.report.actualContact.role}</div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "outcome",
      header: "Outcome",
      filterable: true,
      render: (value, task) =>
        task.report.outcome ? (
          <Badge variant={getOutcomeVariant(task.report.outcome)} className="text-xs">
            {getOutcomeLabel(task.report.outcome)}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "orderValue",
      header: "Order Value",
      render: (value, task) =>
        task.report.orderValue && task.report.orderValue > 0 ? (
          <span className="font-medium text-sm">{formatCurrency(task.report.orderValue)}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "duration",
      header: "Visit Duration",
      sortable: false,
      render: (value, task) =>
        task.report.checkIn && task.report.checkOut ? (
          <span className="text-sm">
            {Math.round(dayjs(task.report.checkOut.at).diff(dayjs(task.report.checkIn.at), "minute"))} min
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "gps",
      header: "GPS",
      sortable: false,
      render: (value, task) =>
        task.report.checkIn?.gps ? (
          <button
            onClick={() => {
              const { lat, lng } = task.report.checkIn.gps
              window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank")
            }}
            className="text-success hover:text-success/80"
          >
            <MapPin className="h-4 w-4" />
          </button>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
          <HistoryIcon className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
          Visit History
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Your completed visits and performance summary</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{summaryStats.totalVisits}</div>
            <p className="text-xs text-muted-foreground">Completed visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Won Deals</CardTitle>
            <Award className="h-4 w-4 text-green-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-500">{summaryStats.wonDeals}</div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.totalVisits > 0 ? Math.round((summaryStats.wonDeals / summaryStats.totalVisits) * 100) : 0}%
              win rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-500">{formatCurrency(summaryStats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">Total order value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-purple-500">{formatCurrency(summaryStats.avgValue)}</div>
            <p className="text-xs text-muted-foreground">Average per visit</p>
          </CardContent>
        </Card>
      </div>

      {/* Visit History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="h-5 w-5 flex-shrink-0" />
            Visit Reports
          </CardTitle>
          <CardDescription>
            {completedTasksWithReports.length} completed visit{completedTasksWithReports.length !== 1 ? "s" : ""} with
            reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {completedTasksWithReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No visit history</h3>
              <p className="text-sm text-muted-foreground">
                Complete some visits to see your history and performance metrics here.
              </p>
            </div>
          ) : (
            <DataTable
              data={completedTasksWithReports}
              columns={columns}
              searchable={true}
              filterable={true}
              sortable={true}
              exportable={true}
              pageSize={10}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
