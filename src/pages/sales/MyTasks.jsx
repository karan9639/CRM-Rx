"use client"

import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import { useDataStore } from "@/store/useDataStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { formatDate, formatTime, isToday, getStatusVariant, getStatusLabel } from "@/utils/format"
import { Calendar, Search, MapPin, Play, Eye } from "lucide-react"
import dayjs from "dayjs"

export default function MyTasks() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { tasks, companies, visitReports } = useDataStore()
  const [activeTab, setActiveTab] = useState("today")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Get user's tasks with company details
  const userTasksWithDetails = useMemo(() => {
    return tasks
      .filter((task) => task.salespersonId === user?.id)
      .map((task) => {
        const company = companies.find((c) => c.id === task.companyId)
        const report = visitReports.find((r) => r.taskId === task.id)
        return { ...task, company, report }
      })
      .sort((a, b) => dayjs(a.dueAt).diff(dayjs(b.dueAt)))
  }, [tasks, companies, visitReports, user?.id])

  // Filter tasks based on active tab
  const filteredTasks = useMemo(() => {
    let filtered = userTasksWithDetails

    // Filter by tab
    switch (activeTab) {
      case "today":
        filtered = filtered.filter((task) => isToday(task.dueAt))
        break
      case "upcoming":
        filtered = filtered.filter((task) => dayjs(task.dueAt).isAfter(dayjs(), "day"))
        break
      case "completed":
        filtered = filtered.filter((task) => task.status === "completed")
        break
      default:
        break
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.company?.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.contactHint?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    return filtered
  }, [userTasksWithDetails, activeTab, searchTerm, statusFilter])

  const tabs = [
    { id: "today", label: "Today", count: userTasksWithDetails.filter((task) => isToday(task.dueAt)).length },
    {
      id: "upcoming",
      label: "Upcoming",
      count: userTasksWithDetails.filter((task) => dayjs(task.dueAt).isAfter(dayjs(), "day")).length,
    },
    {
      id: "completed",
      label: "Completed",
      count: userTasksWithDetails.filter((task) => task.status === "completed").length,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Tasks</h1>
        <p className="text-muted-foreground">Manage your assigned visits and track your progress</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by company name, city, or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            {tabs.find((tab) => tab.id === activeTab)?.label} Tasks
          </CardTitle>
          <CardDescription>
            {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No tasks found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "You have no tasks in this category."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-medium text-muted-foreground">
                          {formatDate(task.dueAt)} at {formatTime(task.dueAt)}
                        </div>
                        <Badge variant={getStatusVariant(task.status)}>{getStatusLabel(task.status)}</Badge>
                      </div>
                      {task.report?.checkIn && (
                        <div className="text-sm text-muted-foreground">
                          Checked in at {formatTime(task.report.checkIn.at)}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-medium text-foreground">{task.company?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {task.company?.address.line1}, {task.company?.address.city}, {task.company?.address.state}
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

                    {task.notes && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Notes: </span>
                        <span>{task.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-6">
                    {task.status === "assigned" && isToday(task.dueAt) && (
                      <Button size="sm" className="w-32">
                        <MapPin className="mr-2 h-4 w-4" />
                        Check In
                      </Button>
                    )}

                    {task.status === "in_progress" && (
                      <Button onClick={() => navigate(`/sales/visit/${task.id}`)} size="sm" className="w-32">
                        <Play className="mr-2 h-4 w-4" />
                        Visit Form
                      </Button>
                    )}

                    {task.status === "completed" && (
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/sales/visit/${task.id}`)}
                        size="sm"
                        className="w-32"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Report
                      </Button>
                    )}

                    <Button variant="ghost" size="sm" className="w-32">
                      <MapPin className="mr-2 h-4 w-4" />
                      Directions
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
