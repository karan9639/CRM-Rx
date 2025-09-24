"use client"

import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDataStore } from "@/store/useDataStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { formatDate, formatTime, isToday, getStatusVariant, getStatusLabel } from "@/utils/format"
import {
  Users,
  ClipboardList,
  CheckCircle,
  MapPin,
  Eye,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  Target,
  Activity,
} from "lucide-react"
import dayjs from "dayjs"

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { tasks, users, companies, visitReports } = useDataStore()

  const [dateFilter, setDateFilter] = useState("today")
  const [statusFilter, setStatusFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const metrics = useMemo(() => {
    const todayTasks = tasks.filter((task) => isToday(task.dueAt))
    const completedToday = todayTasks.filter((task) => task.status === "completed")
    const inProgressToday = todayTasks.filter((task) => task.status === "in_progress")
    const pendingToday = todayTasks.filter((task) => task.status === "assigned")
    const missedToday = todayTasks.filter((task) => task.status === "missed")

    // Weekly metrics for comparison
    const weekStart = dayjs().startOf("week")
    const weekTasks = tasks.filter((task) => dayjs(task.dueAt).isAfter(weekStart))
    const weekCompleted = weekTasks.filter((task) => task.status === "completed")

    return {
      today: {
        total: todayTasks.length,
        completed: completedToday.length,
        inProgress: inProgressToday.length,
        pending: pendingToday.length,
        missed: missedToday.length,
        completionRate: todayTasks.length > 0 ? Math.round((completedToday.length / todayTasks.length) * 100) : 0,
      },
      week: {
        total: weekTasks.length,
        completed: weekCompleted.length,
        completionRate: weekTasks.length > 0 ? Math.round((weekCompleted.length / weekTasks.length) * 100) : 0,
      },
    }
  }, [tasks])

  const filteredTasks = useMemo(() => {
    let filtered = tasks.map((task) => {
      const company = companies.find((c) => c.id === task.companyId)
      const salesperson = users.find((u) => u.id === task.salespersonId)
      const report = visitReports.find((r) => r.taskId === task.id)
      return { ...task, company, salesperson, report }
    })

    // Date filtering
    switch (dateFilter) {
      case "today":
        filtered = filtered.filter((task) => isToday(task.dueAt))
        break
      case "week":
        const weekStart = dayjs().startOf("week")
        filtered = filtered.filter((task) => dayjs(task.dueAt).isAfter(weekStart))
        break
      case "month":
        const monthStart = dayjs().startOf("month")
        filtered = filtered.filter((task) => dayjs(task.dueAt).isAfter(monthStart))
        break
    }

    // Status filtering
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    // User filtering
    if (userFilter !== "all") {
      filtered = filtered.filter((task) => task.salespersonId === userFilter)
    }

    // Search filtering
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.salesperson?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.company?.address.city.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    return filtered.sort((a, b) => dayjs(a.dueAt).diff(dayjs(b.dueAt)))
  }, [tasks, companies, users, visitReports, dateFilter, statusFilter, userFilter, searchTerm])

  const salesUsers = users.filter((user) => user.role === "sales")

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Sales Dashboard</h1>
        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">
          Monitor your team's performance and track daily activities
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="metric-card border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Visits</CardTitle>
            <Target className="h-5 w-5 text-primary flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{metrics.today.total}</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {metrics.today.completionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-success">{metrics.today.completed}</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {metrics.today.total - metrics.today.completed} remaining
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <Activity className="h-5 w-5 text-warning flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-warning">{metrics.today.inProgress}</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card className="metric-card border-l-4 border-l-info">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Progress</CardTitle>
            <TrendingUp className="h-5 w-5 text-info flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-info">{metrics.week.completionRate}%</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {metrics.week.completed} of {metrics.week.total} completed
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Filter className="h-5 w-5 flex-shrink-0" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </Select>
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

            <div className="space-y-2 sm:col-span-2 lg:col-span-1 xl:col-span-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="Search by company, salesperson, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="data-table">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calendar className="h-5 w-5 flex-shrink-0" />
                Visit Management
              </CardTitle>
              <CardDescription>
                {filteredTasks.length} visit{filteredTasks.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <Button
              onClick={() => navigate("/admin/assign-task")}
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
            >
              Assign New Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No visits found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all" || userFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "No visits scheduled for the selected time period."}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-semibold min-w-[120px]">Date & Time</TableHead>
                      <TableHead className="font-semibold min-w-[150px]">Salesperson</TableHead>
                      <TableHead className="font-semibold min-w-[150px]">Company</TableHead>
                      <TableHead className="font-semibold min-w-[100px]">Status</TableHead>
                      <TableHead className="font-semibold min-w-[100px]">Check-in</TableHead>
                      <TableHead className="font-semibold min-w-[100px]">Check-out</TableHead>
                      <TableHead className="font-semibold min-w-[80px]">GPS</TableHead>
                      <TableHead className="font-semibold min-w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{formatDate(task.dueAt)}</div>
                            <div className="text-xs text-muted-foreground">{formatTime(task.dueAt)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{task.salesperson?.name}</div>
                            <div className="text-xs text-muted-foreground">{task.salesperson?.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{task.company?.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {task.company?.address.city}, {task.company?.address.state}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(task.status)} className="font-medium text-xs">
                            {getStatusLabel(task.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {task.report?.checkIn ? (
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-success">
                                {formatTime(task.report.checkIn.at)}
                              </div>
                              {task.report.checkIn.gps && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  GPS Verified
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {task.report?.checkOut ? (
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-success">
                                {formatTime(task.report.checkOut.at)}
                              </div>
                              {task.report.checkOut.gps && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  GPS Verified
                                </div>
                              )}
                            </div>
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
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/companies/${task.companyId}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card
          className="metric-card cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate("/admin/assign-task")}
        >
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary flex-shrink-0" />
              Assign New Task
            </CardTitle>
            <CardDescription>Create and assign a new visit task to your sales team</CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="metric-card cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate("/admin/tasks")}
        >
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-info flex-shrink-0" />
              View All Tasks
            </CardTitle>
            <CardDescription>Browse and filter all tasks across different time periods</CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="metric-card cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate("/admin/companies")}
        >
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-success flex-shrink-0" />
              Manage Companies
            </CardTitle>
            <CardDescription>Add new companies or update existing company information</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
