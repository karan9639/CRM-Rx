"use client"

import { useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDataStore } from "@/store/useDataStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Map from "@/components/ui/map"
import { formatDate, formatTime, getStatusVariant, getStatusLabel } from "@/utils/format"
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  User,
  FileText,
  Target,
  CheckCircle,
  DollarSign,
  Filter,
  Search,
  Download,
  BarChart3,
  Clock,
  AlertCircle,
  Navigation,
  Eye,
} from "lucide-react"
import dayjs from "dayjs"

export default function CompanyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { companies, tasks, users, visitReports } = useDataStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [outcomeFilter, setOutcomeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  // Find company and related data
  const company = companies.find((c) => c.id === id)
  const companyTasks = tasks.filter((task) => task.companyId === id)
  const companyReports = visitReports.filter((report) => report.companyId === id)

  // Enhanced tasks with user and report data
  const tasksWithDetails = useMemo(() => {
    return companyTasks
      .map((task) => {
        const salesperson = users.find((u) => u.id === task.salespersonId)
        const report = visitReports.find((r) => r.taskId === task.id)
        return { ...task, salesperson, report }
      })
      .sort((a, b) => dayjs(b.dueAt).diff(dayjs(a.dueAt)))
  }, [companyTasks, users, visitReports])

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasksWithDetails

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.salesperson?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.contactHint?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.notes?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    // Outcome filter
    if (outcomeFilter !== "all") {
      filtered = filtered.filter((task) => task.report?.outcome === outcomeFilter)
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = dayjs()
      switch (dateFilter) {
        case "week":
          filtered = filtered.filter((task) => dayjs(task.dueAt).isAfter(now.subtract(1, "week")))
          break
        case "month":
          filtered = filtered.filter((task) => dayjs(task.dueAt).isAfter(now.subtract(1, "month")))
          break
        case "quarter":
          filtered = filtered.filter((task) => dayjs(task.dueAt).isAfter(now.subtract(3, "month")))
          break
        case "year":
          filtered = filtered.filter((task) => dayjs(task.dueAt).isAfter(now.subtract(1, "year")))
          break
      }
    }

    return filtered
  }, [tasksWithDetails, searchTerm, statusFilter, outcomeFilter, dateFilter])

  // Map positions from visit reports
  const mapPositions = useMemo(() => {
    return companyReports
      .filter((report) => report.checkIn?.gps)
      .map((report, index) => {
        const task = tasks.find((t) => t.id === report.taskId)
        const salesperson = users.find((u) => u.id === report.salespersonId)
        return {
          lat: report.checkIn.gps.lat,
          lng: report.checkIn.gps.lng,
          title: `Visit ${index + 1}`,
          description: `${formatDate(report.checkIn.at)} - ${salesperson?.name} - ${report.outcome || "No outcome"}`,
        }
      })
  }, [companyReports, tasks, users])

  // Enhanced company statistics
  const stats = useMemo(() => {
    const totalTasks = companyTasks.length
    const completedTasks = companyTasks.filter((task) => task.status === "completed").length
    const inProgressTasks = companyTasks.filter((task) => task.status === "in_progress").length
    const overdueTasks = companyTasks.filter(
      (task) => dayjs(task.dueAt).isBefore(dayjs(), "day") && task.status !== "completed",
    ).length

    const totalValue = companyReports.reduce((sum, report) => sum + (report.orderValue || 0), 0)
    const wonDeals = companyReports.filter((report) => report.outcome === "closed_win").length
    const lostDeals = companyReports.filter((report) => report.outcome === "closed_lost").length
    const avgVisitDuration =
      companyReports.length > 0
        ? Math.round(
            companyReports.reduce((sum, report) => sum + (report.visitDuration || 0), 0) / companyReports.length,
          )
        : 0

    // Recent activity (last 30 days)
    const recentTasks = companyTasks.filter((task) => dayjs(task.dueAt).isAfter(dayjs().subtract(30, "day")))

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalValue,
      wonDeals,
      lostDeals,
      avgVisitDuration,
      recentActivity: recentTasks.length,
    }
  }, [companyTasks, companyReports])

  // Export company data
  const exportCompanyData = () => {
    const csvData = filteredTasks.map((task) => ({
      Date: formatDate(task.dueAt),
      Time: formatTime(task.dueAt),
      Salesperson: task.salesperson?.name || "",
      Status: getStatusLabel(task.status),
      Contact: task.report?.actualContact?.name || task.contactHint?.name || "",
      Outcome: task.report?.outcome || "",
      OrderValue: task.report?.orderValue || 0,
      VisitDuration: task.report?.visitDuration || 0,
      Notes: task.notes || "",
    }))

    const csvContent = [
      `Company: ${company?.name}`,
      `Address: ${company?.address.line1}, ${company?.address.city}, ${company?.address.state}`,
      `Export Date: ${dayjs().format("YYYY-MM-DD HH:mm")}`,
      "",
      Object.keys(csvData[0] || {}).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${company?.name.replace(/\s+/g, "-")}-history-${dayjs().format("YYYY-MM-DD")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
        <h2 className="text-xl font-semibold text-muted-foreground mb-4">Company not found</h2>
        <Button onClick={() => navigate("/admin/companies")} className="bg-primary hover:bg-primary/90">
          Back to Companies
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/admin/companies")} className="hover:bg-muted/50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{company.name}</h1>
            <p className="text-xl text-muted-foreground flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              {company.address.city}, {company.address.state}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCompanyData}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button onClick={() => navigate(`/admin/assign-task?company=${id}`)}>
            <Calendar className="mr-2 h-4 w-4" />
            Assign Task
          </Button>
        </div>
      </div>

      {/* Enhanced Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        <Card className="metric-card border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Visits</CardTitle>
            <Target className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalTasks}</div>
            <p className="text-sm text-muted-foreground mt-1">{stats.completionRate}% success rate</p>
          </CardContent>
        </Card>

        <Card className="metric-card border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CheckCircle className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats.completedTasks}</div>
            <p className="text-sm text-muted-foreground mt-1">{stats.wonDeals} deals won</p>
          </CardContent>
        </Card>

        <Card className="metric-card border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <Clock className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{stats.inProgressTasks}</div>
            <p className="text-sm text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card className="metric-card border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            <AlertCircle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{stats.overdueTasks}</div>
            <p className="text-sm text-muted-foreground mt-1">Need attention</p>
          </CardContent>
        </Card>

        <Card className="metric-card border-l-4 border-l-info">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Order Value</CardTitle>
            <DollarSign className="h-5 w-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-info">₹{stats.totalValue.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground mt-1">Total generated</p>
          </CardContent>
        </Card>

        <Card className="metric-card border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration</CardTitle>
            <BarChart3 className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">{stats.avgVisitDuration}m</div>
            <p className="text-sm text-muted-foreground mt-1">Per visit</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Company Information */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Company Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="text-sm font-medium text-muted-foreground mb-2">Address</div>
                <div className="space-y-1">
                  <div>{company.address.line1}</div>
                  <div>
                    {company.address.city}, {company.address.state}
                  </div>
                  <div>{company.address.pincode}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 p-0 h-auto"
                  onClick={() => {
                    const address = `${company.address.line1}, ${company.address.city}, ${company.address.state} ${company.address.pincode}`
                    const encodedAddress = encodeURIComponent(address)
                    window.open(`https://maps.google.com/maps?daddr=${encodedAddress}`, "_blank")
                  }}
                >
                  <Navigation className="mr-1 h-3 w-3" />
                  Get Directions
                </Button>
              </div>

              {company.contacts && company.contacts.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-3">Contacts</div>
                  <div className="space-y-3">
                    {company.contacts.map((contact) => (
                      <div key={contact.id} className="p-3 bg-muted/20 rounded-lg border border-border/30">
                        <div className="flex items-center mb-2">
                          <User className="mr-2 h-4 w-4 text-primary" />
                          <span className="font-medium">{contact.name}</span>
                          {contact.role && <span className="ml-2 text-muted-foreground text-sm">({contact.role})</span>}
                        </div>
                        <div className="space-y-1">
                          {contact.phone && (
                            <a
                              href={`tel:${contact.phone}`}
                              className="flex items-center text-sm text-primary hover:underline"
                            >
                              <Phone className="mr-2 h-3 w-3" />
                              {contact.phone}
                            </a>
                          )}
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              className="flex items-center text-sm text-primary hover:underline"
                            >
                              <Mail className="mr-2 h-3 w-3" />
                              {contact.email}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {company.notes && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Notes</div>
                  <div className="text-sm p-3 bg-muted/20 rounded-lg border border-border/30">{company.notes}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Visit Locations Map */}
          {mapPositions.length > 0 && (
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-info" />
                  Visit Locations
                </CardTitle>
                <CardDescription>{mapPositions.length} GPS locations recorded</CardDescription>
              </CardHeader>
              <CardContent>
                <Map positions={mapPositions} height="300px" />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Visit History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Visit History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Salesperson, contact..."
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
                  <label className="text-sm font-medium">Outcome</label>
                  <Select value={outcomeFilter} onChange={(e) => setOutcomeFilter(e.target.value)}>
                    <option value="all">All Outcomes</option>
                    <option value="met">Met</option>
                    <option value="not_available">Not Available</option>
                    <option value="closed_win">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                    <option value="follow_up">Follow Up</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Period</label>
                  <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                    <option value="all">All Time</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="quarter">Last Quarter</option>
                    <option value="year">Last Year</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visit History Table */}
          <Card className="data-table">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Visit History
              </CardTitle>
              <CardDescription>
                {filteredTasks.length} visit{filteredTasks.length !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTasks.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No visits found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm || statusFilter !== "all" || outcomeFilter !== "all" || dateFilter !== "all"
                      ? "Try adjusting your filters to see more results."
                      : "This company has no assigned tasks or visits."}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="font-semibold">Date & Time</TableHead>
                        <TableHead className="font-semibold">Salesperson</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Contact</TableHead>
                        <TableHead className="font-semibold">Outcome</TableHead>
                        <TableHead className="font-semibold">Value</TableHead>
                        <TableHead className="font-semibold">Duration</TableHead>
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
                              <span className="font-medium text-success">
                                ₹{task.report.orderValue.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {task.report?.visitDuration ? (
                              <span className="text-sm">{task.report.visitDuration}m</span>
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
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/sales/visit/${task.id}`)}>
                              <Eye className="h-4 w-4" />
                            </Button>
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
      </div>
    </div>
  )
}
