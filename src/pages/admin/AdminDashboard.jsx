"use client"

import { useMemo } from "react"
import { useDataStore } from "@/store/useDataStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { formatDate, formatTime, isToday, getStatusVariant, getStatusLabel } from "@/utils/format"
import { Users, ClipboardList, CheckCircle, Clock, MapPin, Eye } from "lucide-react"
import dayjs from "dayjs"

export default function AdminDashboard() {
  const { tasks, users, companies, visitReports } = useDataStore()

  // Calculate today's metrics
  const todayMetrics = useMemo(() => {
    const todayTasks = tasks.filter((task) => isToday(task.dueAt))
    const completedToday = todayTasks.filter((task) => task.status === "completed")
    const inProgressToday = todayTasks.filter((task) => task.status === "in_progress")
    const pendingToday = todayTasks.filter((task) => task.status === "assigned")

    return {
      total: todayTasks.length,
      completed: completedToday.length,
      inProgress: inProgressToday.length,
      pending: pendingToday.length,
    }
  }, [tasks])

  // Get today's tasks with company and user details
  const todayTasksWithDetails = useMemo(() => {
    return tasks
      .filter((task) => isToday(task.dueAt))
      .map((task) => {
        const company = companies.find((c) => c.id === task.companyId)
        const salesperson = users.find((u) => u.id === task.salespersonId)
        const report = visitReports.find((r) => r.taskId === task.id)

        return {
          ...task,
          company,
          salesperson,
          report,
        }
      })
      .sort((a, b) => dayjs(a.dueAt).diff(dayjs(b.dueAt)))
  }, [tasks, companies, users, visitReports])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Today's Dashboard</h1>
        <p className="text-muted-foreground">Monitor your sales team's daily activities</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayMetrics.total}</div>
            <p className="text-xs text-muted-foreground">Assigned for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{todayMetrics.completed}</div>
            <p className="text-xs text-muted-foreground">
              {todayMetrics.total > 0 ? Math.round((todayMetrics.completed / todayMetrics.total) * 100) : 0}% completion
              rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{todayMetrics.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayMetrics.pending}</div>
            <p className="text-xs text-muted-foreground">Not started yet</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Visits Table */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Visits</CardTitle>
          <CardDescription>Real-time status of all scheduled visits for {formatDate(new Date())}</CardDescription>
        </CardHeader>
        <CardContent>
          {todayTasksWithDetails.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No visits scheduled for today</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Salesperson</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayTasksWithDetails.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{formatTime(task.dueAt)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{task.salesperson?.name}</div>
                        <div className="text-sm text-muted-foreground">{task.salesperson?.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{task.company?.name}</div>
                        <div className="text-sm text-muted-foreground">{task.company?.address.city}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(task.status)}>{getStatusLabel(task.status)}</Badge>
                    </TableCell>
                    <TableCell>
                      {task.report?.checkIn ? (
                        <div className="text-sm">
                          <div>{formatTime(task.report.checkIn.at)}</div>
                          {task.report.checkIn.gps && <div className="text-muted-foreground">GPS: ✓</div>}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.report?.checkOut ? (
                        <div className="text-sm">
                          <div>{formatTime(task.report.checkOut.at)}</div>
                          {task.report.checkOut.gps && <div className="text-muted-foreground">GPS: ✓</div>}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.report?.checkIn?.gps ? (
                        <Button variant="ghost" size="sm">
                          <MapPin className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg">Assign New Task</CardTitle>
            <CardDescription>Create and assign a new visit task to your sales team</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg">View All Tasks</CardTitle>
            <CardDescription>Browse and filter all tasks across different time periods</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg">Manage Companies</CardTitle>
            <CardDescription>Add new companies or update existing company information</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
