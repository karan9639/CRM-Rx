"use client"

import { useParams, useNavigate } from "react-router-dom"
import { useDataStore } from "@/store/useDataStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { ArrowLeft, Calendar, MapPin, Building, User, CheckCircle } from "lucide-react"
import { useMemo } from "react"
import { formatDate, formatTime } from "@/utils/format"

export default function UserHistory() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { users, tasks, visits } = useDataStore()

  // Find the user
  const user = users.find((u) => u.id === Number.parseInt(userId))

  // Get user's tasks and visits
  const userTasks = useMemo(() => {
    return tasks.filter((task) => task.salespersonId === Number.parseInt(userId))
  }, [tasks, userId])

  const userVisits = useMemo(() => {
    return visits.filter((visit) => visit.salespersonId === Number.parseInt(userId))
  }, [visits, userId])

  // Combine tasks and visits for timeline
  const timeline = useMemo(() => {
    const items = []

    // Add tasks
    userTasks.forEach((task) => {
      items.push({
        id: `task-${task.id}`,
        type: "task",
        date: task.createdAt,
        title: task.title,
        status: task.status,
        company: task.companyName,
        dueDate: task.dueAt,
        priority: task.priority,
        data: task,
      })
    })

    // Add visits
    userVisits.forEach((visit) => {
      items.push({
        id: `visit-${visit.id}`,
        type: "visit",
        date: visit.visitDate,
        title: `Visit to ${visit.companyName}`,
        status: visit.meetingStatus,
        company: visit.companyName,
        location: visit.location,
        data: visit,
      })
    })

    // Sort by date (newest first)
    return items.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [userTasks, userVisits])

  const columns = [
    {
      key: "date",
      header: "Date",
      render: (value) => (
        <div>
          <div className="font-medium">{formatDate(value)}</div>
          <div className="text-sm text-muted-foreground">{formatTime(value)}</div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (value) => (
        <Badge variant={value === "task" ? "default" : "secondary"}>{value === "task" ? "Task" : "Visit"}</Badge>
      ),
    },
    {
      key: "title",
      header: "Activity",
      render: (value, item) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground flex items-center">
            <Building className="mr-1 h-3 w-3" />
            {item.company}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, item) => {
        const getStatusVariant = (status, type) => {
          if (type === "task") {
            switch (status) {
              case "completed":
                return "success"
              case "in-progress":
                return "warning"
              case "pending":
                return "outline"
              default:
                return "outline"
            }
          } else {
            switch (status) {
              case "completed":
                return "success"
              case "scheduled":
                return "warning"
              case "cancelled":
                return "destructive"
              default:
                return "outline"
            }
          }
        }

        return <Badge variant={getStatusVariant(value, item.type)}>{value}</Badge>
      },
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (value, item) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (item.type === "task") {
              navigate(`/admin/tasks`)
            } else {
              // Could navigate to visit details if needed
              console.log("View visit details:", item.data)
            }
          }}
        >
          View Details
        </Button>
      ),
    },
  ]

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold">User not found</h2>
          <p className="text-muted-foreground">The requested user could not be found.</p>
          <Button onClick={() => navigate("/admin/users")} className="mt-4">
            Back to Users
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/users")} className="hover:bg-accent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{user.name}'s History</h1>
            <p className="text-muted-foreground">Complete activity timeline and performance overview</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userTasks.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userTasks.filter((t) => t.status === "completed").length}</div>
            <p className="text-xs text-muted-foreground">
              {userTasks.length > 0
                ? Math.round((userTasks.filter((t) => t.status === "completed").length / userTasks.length) * 100)
                : 0}
              % completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userVisits.length}</div>
            <p className="text-xs text-muted-foreground">Field visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userVisits.length > 0
                ? Math.round(
                    (userVisits.filter((v) => v.meetingStatus === "completed").length / userVisits.length) * 100,
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Visit success</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Complete history of tasks and visits for {user.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={timeline}
            columns={columns}
            searchable={true}
            filterable={true}
            sortable={true}
            exportable={true}
            pageSize={15}
          />
        </CardContent>
      </Card>
    </div>
  )
}
