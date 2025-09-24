"use client"

import { useMemo } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { useDataStore } from "@/store/useDataStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { formatDate, formatTime, formatCurrency } from "@/utils/format"
import { HistoryIcon, Calendar, FileText, MapPin } from "lucide-react"
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
          <div className="font-medium">{formatDate(task.report.submittedAt)}</div>
          <div className="text-sm text-muted-foreground">{formatTime(task.report.submittedAt)}</div>
        </div>
      ),
    },
    {
      key: "companyName",
      header: "Company",
      filterable: true,
      render: (value, task) => (
        <div>
          <div className="font-medium">{task.company?.name}</div>
          <div className="text-sm text-muted-foreground">{task.company?.address.city}</div>
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
            <div className="font-medium">{task.report.actualContact.name}</div>
            {task.report.actualContact.role && (
              <div className="text-sm text-muted-foreground">{task.report.actualContact.role}</div>
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
          <Badge variant={getOutcomeVariant(task.report.outcome)}>{getOutcomeLabel(task.report.outcome)}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "orderValue",
      header: "Order Value",
      render: (value, task) =>
        task.report.orderValue && task.report.orderValue > 0 ? (
          <span className="font-medium">{formatCurrency(task.report.orderValue)}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "duration",
      header: "Visit Duration",
      sortable: false,
      render: (value, task) =>
        task.report.checkIn ? (
          <div className="text-sm">
            {formatTime(task.report.checkIn.at)} -{" "}
            {task.report.checkOut ? formatTime(task.report.checkOut.at) : "Ongoing"}
          </div>
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
          <div className="flex items-center text-green-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-xs">Captured</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">No GPS</span>
        ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Visit History</h1>
        <p className="text-muted-foreground">Review your past visits and submitted reports</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <HistoryIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalVisits}</div>
            <p className="text-xs text-muted-foreground">Completed visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Won Deals</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{summaryStats.wonDeals}</div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.totalVisits > 0 ? Math.round((summaryStats.wonDeals / summaryStats.totalVisits) * 100) : 0}%
              win rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">Order value generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.avgValue)}</div>
            <p className="text-xs text-muted-foreground">Average order value</p>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Visit Reports</CardTitle>
          <CardDescription>
            {completedTasksWithReports.length} report{completedTasksWithReports.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={completedTasksWithReports}
            columns={columns}
            searchable={true}
            filterable={true}
            sortable={true}
            exportable={true}
            pageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  )
}
