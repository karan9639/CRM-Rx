"use client"

import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDataStore } from "@/store/useDataStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate, formatTime, getStatusVariant, getStatusLabel } from "@/utils/format"
import {
  ClipboardList,
  Search,
  Filter,
  TrendingUp,
  MapPin,
  Eye,
  Edit,
  Download,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react"
import dayjs from "dayjs"

export default function AllTasks() {
  const navigate = useNavigate()
  const { tasks, users, companies, visitReports } = useDataStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [outcomeFilter, setOutcomeFilter] = useState("all")

  // Get tasks with related data
  const tasksWithDetails = useMemo(() => {
    return tasks
      .map((task) => {
        const company = companies.find((c) => c.id === task.companyId)
        const salesperson = users.find((u) => u.id === task.salespersonId)
        const assignedBy = users.find((u) => u.id === task.assignedByAdminId)
        const report = visitReports.find((r) => r.taskId === task.id)

        return {
          ...task,
          company,
          salesperson,
          assignedBy,
          report,
          companyName: company?.name || "",
          salespersonName: salesperson?.name || "",
          cityName: company?.address.city || "",
          contactName: task.contactHint?.name || "",
          outcome: report?.outcome || "",
          orderValue: report?.orderValue || 0,
        }
      })
      .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)))
  }, [tasks, companies, users, visitReports])

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasksWithDetails

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.salesperson?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.company?.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.contactHint?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    // User filter
    if (userFilter !== "all") {
      filtered = filtered.filter((task) => task.salespersonId === userFilter)
    }

    // Company filter
    if (companyFilter !== "all") {
      filtered = filtered.filter((task) => task.companyId === companyFilter)
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = dayjs()
      switch (dateFilter) {
        case "today":
          filtered = filtered.filter((task) => dayjs(task.dueAt).isSame(now, "day"))
          break
        case "week":
          filtered = filtered.filter((task) => dayjs(task.dueAt).isSame(now, "week"))
          break
        case "month":
          filtered = filtered.filter((task) => dayjs(task.dueAt).isSame(now, "month"))
          break
        case "overdue":
          filtered = filtered.filter((task) => dayjs(task.dueAt).isBefore(now, "day") && task.status !== "completed")
          break
      }
    }

    // Outcome filter
    if (outcomeFilter !== "all") {
      filtered = filtered.filter((task) => task.report?.outcome === outcomeFilter)
    }

    return filtered
  }, [tasksWithDetails, searchTerm, statusFilter, userFilter, companyFilter, dateFilter, outcomeFilter])

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = tasksWithDetails.length
    const completed = tasksWithDetails.filter((task) => task.status === "completed").length
    const inProgress = tasksWithDetails.filter((task) => task.status === "in_progress").length
    const overdue = tasksWithDetails.filter(
      (task) => dayjs(task.dueAt).isBefore(dayjs(), "day") && task.status !== "completed",
    ).length
    const totalValue = tasksWithDetails.reduce((sum, task) => sum + (task.report?.orderValue || 0), 0)

    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalValue,
    }
  }, [tasksWithDetails])

  const salesUsers = users.filter((user) => user.role === "sales")
  const uniqueCompanies = [...new Set(tasksWithDetails.map((task) => task.company).filter(Boolean))]

  const exportToCSV = () => {
    const csvData = filteredTasks.map((task) => ({
      Date: formatDate(task.dueAt),
      Time: formatTime(task.dueAt),
      Company: task.company?.name || "",
      City: task.company?.address.city || "",
      Salesperson: task.salesperson?.name || "",
      Status: getStatusLabel(task.status),
      Contact: task.contactHint?.name || "",
      Outcome: task.report?.outcome || "",
      OrderValue: task.report?.orderValue || 0,
      Notes: task.notes || "",
    }))

    const csvContent = [Object.keys(csvData[0]).join(","), ...csvData.map((row) => Object.values(row).join(","))].join(
      "\n",
    )

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tasks-export-${dayjs().format("YYYY-MM-DD")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Task Management</h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive view of all tasks with advanced filtering and analytics
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="metric-card border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
            <Target className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.total}</div>
            <p className="text-sm text-muted-foreground mt-1">{metrics.completionRate}% completion rate</p>
          </CardContent>
        </Card>

        <Card className="metric-card border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CheckCircle className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{metrics.completed}</div>
            <p className="text-sm text-muted-foreground mt-1">Successfully finished</p>
          </CardContent>
        </Card>

        <Card className="metric-card border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <Clock className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{metrics.inProgress}</div>
            <p className="text-sm text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card className="metric-card border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            <AlertCircle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{metrics.overdue}</div>
            <p className="text-sm text-muted-foreground mt-1">Need attention</p>
          </CardContent>
        </Card>

        <Card className="metric-card border-l-4 border-l-info">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            <TrendingUp className="h-5 w-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-info">₹{metrics.totalValue.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground mt-1">Order value generated</p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filters */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
          </CardTitle>
          <CardDescription>Filter and search tasks with multiple criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Company, user, city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Salesperson</label>
              <Select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
                <option value="all">All Users</option>
                {salesUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <Select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)}>
                <option value="all">All Companies</option>
                {uniqueCompanies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="overdue">Overdue</option>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Outcome</label>
              <Select value={outcomeFilter} onChange={(e) => setOutcomeFilter(e.target.value)}>
                <option value="all">All Outcomes</option>
                <option value="met">Met</option>
                <option value="not_available">Not Available</option>
                <option value="rescheduled">Rescheduled</option>
                <option value="closed_win">Closed Won</option>
                <option value="closed_lost">Closed Lost</option>
                <option value="follow_up">Follow Up</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card className="data-table">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                All Tasks
              </CardTitle>
              <CardDescription>
                {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportToCSV} className="flex items-center gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={() => navigate("/admin/assign-task")} className="bg-primary hover:bg-primary/90">
                Assign New Task
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16">
              <ClipboardList className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No tasks found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters to see more results.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold">Date & Time</TableHead>
                    <TableHead className="font-semibold">Company</TableHead>
                    <TableHead className="font-semibold">Salesperson</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Outcome</TableHead>
                    <TableHead className="font-semibold">Order Value</TableHead>
                    <TableHead className="font-semibold">GPS</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{formatDate(task.dueAt)}</div>
                          <div className="text-sm text-muted-foreground">{formatTime(task.dueAt)}</div>
                          {dayjs(task.dueAt).isBefore(dayjs(), "day") && task.status !== "completed" && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div
                            className="font-medium cursor-pointer hover:text-primary hover:underline"
                            onClick={() => navigate(`/admin/companies/${task.companyId}`)}
                          >
                            {task.company?.name}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {task.company?.address.city}, {task.company?.address.state}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{task.salesperson?.name}</div>
                          <div className="text-sm text-muted-foreground">{task.salesperson?.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(task.status)} className="font-medium">
                          {getStatusLabel(task.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.report?.actualContact?.name || task.contactHint?.name ? (
                          <div className="space-y-1">
                            <div className="font-medium">
                              {task.report?.actualContact?.name || task.contactHint?.name}
                            </div>
                            {(task.report?.actualContact?.role || task.contactHint?.role) && (
                              <div className="text-sm text-muted-foreground">
                                {task.report?.actualContact?.role || task.contactHint?.role}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.report?.outcome ? (
                          <Badge variant={getStatusVariant(task.report.outcome)} className="font-medium">
                            {task.report.outcome.replace("_", " ")}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.report?.orderValue ? (
                          <span className="font-medium text-success">₹{task.report.orderValue.toLocaleString()}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.report?.checkIn?.gps ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const { lat, lng } = task.report.checkIn.gps
                              window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank")
                            }}
                          >
                            <MapPin className="h-4 w-4 text-success" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/companies/${task.companyId}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {task.status === "assigned" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/assign-task?edit=${task.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
