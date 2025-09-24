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
import GPSCapture from "@/components/common/GPSCapture"
import { formatDate, formatTime, isToday, getStatusVariant, getStatusLabel } from "@/utils/format"
import {
  Calendar,
  Search,
  MapPin,
  Play,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Navigation,
  Phone,
  Mail,
  Building2,
} from "lucide-react"
import dayjs from "dayjs"

export default function MyTasks() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { tasks, companies, visitReports, updateTask, addVisitReport } = useDataStore()
  const [activeTab, setActiveTab] = useState("today")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [gpsLocation, setGpsLocation] = useState(null)
  const [isCheckingIn, setIsCheckingIn] = useState(false)

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
      case "overdue":
        filtered = filtered.filter((task) => dayjs(task.dueAt).isBefore(dayjs(), "day") && task.status !== "completed")
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
    {
      id: "today",
      label: "Today",
      count: userTasksWithDetails.filter((task) => isToday(task.dueAt)).length,
      icon: Calendar,
    },
    {
      id: "upcoming",
      label: "Upcoming",
      count: userTasksWithDetails.filter((task) => dayjs(task.dueAt).isAfter(dayjs(), "day")).length,
      icon: Clock,
    },
    {
      id: "overdue",
      label: "Overdue",
      count: userTasksWithDetails.filter(
        (task) => dayjs(task.dueAt).isBefore(dayjs(), "day") && task.status !== "completed",
      ).length,
      icon: AlertCircle,
    },
    {
      id: "completed",
      label: "Completed",
      count: userTasksWithDetails.filter((task) => task.status === "completed").length,
      icon: CheckCircle,
    },
  ]

  const handleCheckIn = async (task) => {
    setSelectedTask(task)
    setShowCheckInModal(true)
  }

  const confirmCheckIn = async () => {
    if (!gpsLocation || !selectedTask) return

    setIsCheckingIn(true)
    try {
      // Create check-in report
      const checkInData = {
        taskId: selectedTask.id,
        salespersonId: user.id,
        companyId: selectedTask.companyId,
        checkIn: {
          at: new Date().toISOString(),
          gps: gpsLocation,
        },
      }

      addVisitReport(checkInData)
      updateTask(selectedTask.id, { status: "in_progress" })

      setShowCheckInModal(false)
      setSelectedTask(null)
      setGpsLocation(null)
    } catch (error) {
      console.error("Error checking in:", error)
      alert("Error checking in. Please try again.")
    } finally {
      setIsCheckingIn(false)
    }
  }

  const getDirections = (task) => {
    if (task.company?.address) {
      const address = `${task.company.address.line1}, ${task.company.address.city}, ${task.company.address.state} ${task.company.address.pincode}`
      const encodedAddress = encodeURIComponent(address)
      window.open(`https://maps.google.com/maps?daddr=${encodedAddress}`, "_blank")
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">My Tasks</h1>
        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">
          Manage your assigned visits and track your progress
        </p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 bg-muted/30 p-2 rounded-xl min-w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap min-w-fit ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="hidden xs:inline">{tab.label}</span>
                <span className="xs:hidden">{tab.label.split(" ")[0]}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${
                      activeTab === tab.id
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <Card className="glass-effect">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground flex-shrink-0" />
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
      <Card className="data-table">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            {tabs.find((tab) => tab.id === activeTab)?.icon &&
              (() => {
                const IconComponent = tabs.find((tab) => tab.id === activeTab).icon
                return <IconComponent className="h-5 w-5 flex-shrink-0" />
              })()}
            {tabs.find((tab) => tab.id === activeTab)?.label} Tasks
          </CardTitle>
          <CardDescription>
            {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <Calendar className="h-12 sm:h-16 w-12 sm:w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-base sm:text-lg font-medium text-muted-foreground mb-2">No tasks found</h3>
              <p className="text-sm text-muted-foreground px-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "You have no tasks in this category."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="glass-effect hover:bg-card/90 transition-all duration-200">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1 space-y-4">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-sm font-medium text-muted-foreground">
                              {formatDate(task.dueAt)} at {formatTime(task.dueAt)}
                            </div>
                            <Badge variant={getStatusVariant(task.status)} className="font-medium text-xs">
                              {getStatusLabel(task.status)}
                            </Badge>
                            {dayjs(task.dueAt).isBefore(dayjs(), "day") && task.status !== "completed" && (
                              <Badge variant="destructive" className="font-medium text-xs">
                                Overdue
                              </Badge>
                            )}
                          </div>
                          {task.report?.checkIn && (
                            <div className="text-sm text-success font-medium">
                              Checked in at {formatTime(task.report.checkIn.at)}
                            </div>
                          )}
                        </div>

                        {/* Company Info */}
                        <div className="flex items-start gap-3 sm:gap-4">
                          <Building2 className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                          <div className="space-y-1 min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg break-words">{task.company?.name}</h3>
                            <p className="text-muted-foreground text-sm break-words">
                              {task.company?.address.line1}, {task.company?.address.city}, {task.company?.address.state}{" "}
                              {task.company?.address.pincode}
                            </p>
                          </div>
                        </div>

                        {/* Contact Info */}
                        {task.contactHint?.name && (
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className="h-5 w-5 flex-shrink-0" /> {/* Spacer */}
                            <div className="space-y-2 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-muted-foreground text-sm">Contact:</span>
                                <span className="font-medium text-sm break-words">
                                  {task.contactHint.name}
                                  {task.contactHint.role && ` (${task.contactHint.role})`}
                                </span>
                              </div>
                              <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4">
                                {task.contactHint.phone && (
                                  <a
                                    href={`tel:${task.contactHint.phone}`}
                                    className="flex items-center gap-1 text-sm text-primary hover:underline break-all"
                                  >
                                    <Phone className="h-3 w-3 flex-shrink-0" />
                                    {task.contactHint.phone}
                                  </a>
                                )}
                                {task.contactHint.email && (
                                  <a
                                    href={`mailto:${task.contactHint.email}`}
                                    className="flex items-center gap-1 text-sm text-primary hover:underline break-all"
                                  >
                                    <Mail className="h-3 w-3 flex-shrink-0" />
                                    {task.contactHint.email}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Through & Notes */}
                        {(task.through || task.notes) && (
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className="h-5 w-5 flex-shrink-0" /> {/* Spacer */}
                            <div className="space-y-1 min-w-0">
                              {task.through && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Through:</span>
                                  <span className="ml-2 break-words">{task.through}</span>
                                </div>
                              )}
                              {task.notes && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Notes:</span>
                                  <span className="ml-2 break-words">{task.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-row lg:flex-col gap-2 lg:ml-6">
                        {task.status === "assigned" && isToday(task.dueAt) && (
                          <Button
                            onClick={() => handleCheckIn(task)}
                            className="flex-1 lg:w-36 bg-success hover:bg-success/90 text-sm"
                          >
                            <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                            <span className="hidden xs:inline">Check In</span>
                            <span className="xs:hidden">Check</span>
                          </Button>
                        )}

                        {task.status === "in_progress" && (
                          <Button
                            onClick={() => navigate(`/sales/visit/${task.id}`)}
                            className="flex-1 lg:w-36 bg-primary hover:bg-primary/90 text-sm"
                          >
                            <Play className="mr-2 h-4 w-4 flex-shrink-0" />
                            <span className="hidden xs:inline">Visit Form</span>
                            <span className="xs:hidden">Visit</span>
                          </Button>
                        )}

                        {task.status === "completed" && (
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/sales/visit/${task.id}`)}
                            className="flex-1 lg:w-36 text-sm"
                          >
                            <Eye className="mr-2 h-4 w-4 flex-shrink-0" />
                            <span className="hidden xs:inline">View Report</span>
                            <span className="xs:hidden">View</span>
                          </Button>
                        )}

                        <Button variant="ghost" onClick={() => getDirections(task)} className="flex-1 lg:w-36 text-sm">
                          <Navigation className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="hidden xs:inline">Directions</span>
                          <span className="xs:hidden">Map</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showCheckInModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Check In to Visit</CardTitle>
              <CardDescription className="text-sm">
                Confirm your location to check in to {selectedTask.company?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <GPSCapture onLocationCapture={setGpsLocation} autoCapture={true} className="w-full" />

              {gpsLocation && (
                <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">Location captured successfully</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 break-all">
                    Lat: {gpsLocation.lat.toFixed(6)}, Lng: {gpsLocation.lng.toFixed(6)}
                  </div>
                </div>
              )}

              <div className="flex flex-col xs:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCheckInModal(false)
                    setSelectedTask(null)
                    setGpsLocation(null)
                  }}
                  className="flex-1 text-sm"
                >
                  Cancel
                </Button>
                <Button onClick={confirmCheckIn} disabled={!gpsLocation || isCheckingIn} className="flex-1 text-sm">
                  {isCheckingIn ? "Checking In..." : "Confirm Check In"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
