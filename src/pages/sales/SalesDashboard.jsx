"use client"

import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import { useDataStore } from "@/store/useDataStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatTime, isToday, getStatusVariant, getStatusLabel } from "@/utils/format"
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, Play } from "lucide-react"
import dayjs from "dayjs"

export default function SalesDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { tasks, companies, visitReports, updateTask } = useDataStore()

  // Get user's tasks for today
  const todayTasks = useMemo(() => {
    return tasks
      .filter((task) => task.salespersonId === user?.id && isToday(task.dueAt))
      .map((task) => {
        const company = companies.find((c) => c.id === task.companyId)
        const report = visitReports.find((r) => r.taskId === task.id)
        return { ...task, company, report }
      })
      .sort((a, b) => dayjs(a.dueAt).diff(dayjs(b.dueAt)))
  }, [tasks, companies, visitReports, user?.id])

  // Calculate today's metrics
  const todayMetrics = useMemo(() => {
    const total = todayTasks.length
    const completed = todayTasks.filter((task) => task.status === "completed").length
    const inProgress = todayTasks.filter((task) => task.status === "in_progress").length
    const pending = todayTasks.filter((task) => task.status === "assigned").length

    return { total, completed, inProgress, pending }
  }, [todayTasks])

  const handleCheckIn = async (taskId) => {
    try {
      // Request GPS location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const gps = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
            }

            // Update task status to in_progress
            updateTask(taskId, { status: "in_progress" })

            // You would also create a visit report with check-in data here
            // For now, we'll just update the task status
            alert(`Checked in successfully! GPS: ${gps.lat.toFixed(6)}, ${gps.lng.toFixed(6)}`)
          },
          (error) => {
            console.error("GPS Error:", error)
            // Still allow check-in without GPS
            updateTask(taskId, { status: "in_progress" })
            alert("Checked in successfully! (GPS not available)")
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          },
        )
      } else {
        // No GPS support
        updateTask(taskId, { status: "in_progress" })
        alert("Checked in successfully! (GPS not supported)")
      }
    } catch (error) {
      console.error("Check-in error:", error)
      alert("Error during check-in. Please try again.")
    }
  }

  const handleOpenVisitForm = (taskId) => {
    navigate(`/sales/visit/${taskId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Today's Schedule</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Your assigned visits for {formatDate(new Date())}</p>
      </div>

      {/* Today's Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Visits</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{todayMetrics.total}</div>
            <p className="text-xs text-muted-foreground">Assigned for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-500">{todayMetrics.completed}</div>
            <p className="text-xs text-muted-foreground">
              {todayMetrics.total > 0 ? Math.round((todayMetrics.completed / todayMetrics.total) * 100) : 0}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-yellow-500">{todayMetrics.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{todayMetrics.pending}</div>
            <p className="text-xs text-muted-foreground">Not started</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Today's Visits</CardTitle>
          <CardDescription>Your scheduled visits and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          {todayTasks.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No visits scheduled</h3>
              <p className="text-sm text-muted-foreground">You have no visits assigned for today. Enjoy your day!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors gap-4"
                >
                  <div className="flex-1 space-y-2 min-w-0 w-full sm:w-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <div className="text-base sm:text-lg font-semibold">{formatTime(task.dueAt)}</div>
                        <Badge variant={getStatusVariant(task.status)} className="text-xs">
                          {getStatusLabel(task.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {task.report?.checkIn && `Checked in at ${formatTime(task.report.checkIn.at)}`}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-foreground">{task.company?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {task.company?.address.line1}, {task.company?.address.city}
                      </p>
                    </div>

                    {task.contactHint?.name && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Contact: </span>
                        <span className="font-medium">
                          {task.contactHint.name}
                          {task.contactHint.role && ` (${task.contactHint.role})`}
                        </span>
                        {task.contactHint.phone && (
                          <span className="text-muted-foreground ml-2">{task.contactHint.phone}</span>
                        )}
                      </div>
                    )}

                    {task.through && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Through: </span>
                        <span>{task.through}</span>
                      </div>
                    )}

                    {task.notes && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Notes: </span>
                        <span>{task.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 w-full sm:w-auto">
                    {task.status === "assigned" && (
                      <Button onClick={() => handleCheckIn(task.id)} className="flex-1 sm:w-32" size="sm">
                        <MapPin className="mr-2 h-4 w-4" />
                        Check In
                      </Button>
                    )}

                    {task.status === "in_progress" && (
                      <Button onClick={() => handleOpenVisitForm(task.id)} className="flex-1 sm:w-32" size="sm">
                        <Play className="mr-2 h-4 w-4" />
                        Visit Form
                      </Button>
                    )}

                    {task.status === "completed" && (
                      <Button
                        variant="outline"
                        onClick={() => handleOpenVisitForm(task.id)}
                        className="flex-1 sm:w-32"
                        size="sm"
                      >
                        View Report
                      </Button>
                    )}

                    {/* <Button variant="ghost" size="sm" className="flex-1 sm:w-32">
                      <MapPin className="mr-2 h-4 w-4" />
                      Directions
                    </Button> */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate("/sales/tasks")}>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">My Tasks</CardTitle>
            <CardDescription>View all your assigned tasks - today, upcoming, and completed</CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => navigate("/sales/history")}
        >
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Visit History</CardTitle>
            <CardDescription>Browse your past visits and submitted reports</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Performance</CardTitle>
            <CardDescription>View your completion rates and performance metrics</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
