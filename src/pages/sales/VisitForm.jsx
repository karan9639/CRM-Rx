"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import { useDataStore } from "@/store/useDataStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import GPSCapture from "@/components/common/GPSCapture"
import Map from "@/components/ui/map"
import { formatDate, formatTime } from "@/utils/format"
import {
  Clock,
  User,
  FileText,
  Save,
  CheckCircle,
  ArrowLeft,
  MapPin,
  Building2,
  Phone,
  Mail,
  Navigation,
  AlertCircle,
} from "lucide-react"
import dayjs from "dayjs"

export default function VisitForm() {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { tasks, companies, visitReports, updateTask, addVisitReport } = useDataStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkInLocation, setCheckInLocation] = useState(null)
  const [checkOutLocation, setCheckOutLocation] = useState(null)
  const [visitStartTime, setVisitStartTime] = useState(null)

  // Find the task and related data
  const task = tasks.find((t) => t.id === taskId)
  const company = companies.find((c) => c.id === task?.companyId)
  const existingReport = visitReports.find((r) => r.taskId === taskId)

  // Form state
  const [formData, setFormData] = useState({
    projectName: "",
    address: "",
    actualContactName: "",
    department: "",
    actualContactPhone: "",
    actualContactEmail: "",
    actualContactRole: "",
    productPitched: "",
    meetingType: "",
    outcome: "",
    orderValue: "",
    notes: "",
    nextFollowUpDate: "",
    addressCorrections: "",
    visitDuration: "",
    competitorInfo: "",
    clientFeedback: "",
  })

  // Load existing report data if available
  useEffect(() => {
    if (existingReport) {
      setFormData({
        projectName: existingReport.projectName || "",
        address: existingReport.address || "",
        actualContactName: existingReport.actualContact?.name || "",
        department: existingReport.department || "",
        actualContactPhone: existingReport.actualContact?.phone || "",
        actualContactEmail: existingReport.actualContact?.email || "",
        actualContactRole: existingReport.actualContact?.role || "",
        productPitched: existingReport.productPitched || "",
        meetingType: existingReport.meetingType || "",
        outcome: existingReport.outcome || "",
        orderValue: existingReport.orderValue?.toString() || "",
        notes: existingReport.notes || "",
        nextFollowUpDate: existingReport.nextFollowUpAt
          ? dayjs(existingReport.nextFollowUpAt).format("YYYY-MM-DD")
          : "",
        addressCorrections: "",
        visitDuration: existingReport.visitDuration?.toString() || "",
        competitorInfo: existingReport.competitorInfo || "",
        clientFeedback: existingReport.clientFeedback || "",
      })

      // Set existing GPS locations
      if (existingReport.checkIn?.gps) {
        setCheckInLocation(existingReport.checkIn.gps)
      }
      if (existingReport.checkOut?.gps) {
        setCheckOutLocation(existingReport.checkOut.gps)
      }
      if (existingReport.checkIn?.at) {
        setVisitStartTime(existingReport.checkIn.at)
      }
    } else if (task?.contactHint) {
      // Pre-fill with task contact hint
      setFormData((prev) => ({
        ...prev,
        actualContactName: task.contactHint.name || "",
        actualContactRole: task.contactHint.role || "",
        actualContactPhone: task.contactHint.phone || "",
        actualContactEmail: task.contactHint.email || "",
      }))
    }

    // If task is in progress, set check-in location from existing report
    if (task?.status === "in_progress" && existingReport?.checkIn) {
      setCheckInLocation(existingReport.checkIn.gps)
      setVisitStartTime(existingReport.checkIn.at)
    }
  }, [existingReport, task])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCheckOutGPS = (location) => {
    setCheckOutLocation(location)
  }

  const calculateVisitDuration = () => {
    if (visitStartTime && checkOutLocation) {
      const start = dayjs(visitStartTime)
      const end = dayjs()
      const duration = end.diff(start, "minute")
      setFormData((prev) => ({ ...prev, visitDuration: duration.toString() }))
      return duration
    }
    return 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const duration = calculateVisitDuration()

      const reportData = {
        taskId,
        salespersonId: user.id,
        companyId: task.companyId,
        checkIn: existingReport?.checkIn || {
          at: visitStartTime || new Date().toISOString(),
          gps: checkInLocation,
        },
        checkOut: {
          at: new Date().toISOString(),
          gps: checkOutLocation,
        },
        projectName: formData.projectName || undefined,
        address: formData.address || undefined,
        department: formData.department || undefined,
        productPitched: formData.productPitched || undefined,
        meetingType: formData.meetingType || undefined,
        actualContact: {
          name: formData.actualContactName || undefined,
          role: formData.actualContactRole || undefined,
          phone: formData.actualContactPhone || undefined,
          email: formData.actualContactEmail || undefined,
        },
        outcome: formData.outcome || undefined,
        orderValue: formData.orderValue ? Number.parseFloat(formData.orderValue) : undefined,
        notes: formData.notes || undefined,
        nextFollowUpAt: formData.nextFollowUpDate ? dayjs(formData.nextFollowUpDate).toISOString() : undefined,
        visitDuration: duration,
        competitorInfo: formData.competitorInfo || undefined,
        clientFeedback: formData.clientFeedback || undefined,
      }

      if (existingReport) {
        // Update existing report (in a real app, you'd have an updateVisitReport function)
        console.log("Would update existing report:", reportData)
      } else {
        addVisitReport(reportData)
      }

      // Update task status to completed
      updateTask(taskId, { status: "completed" })

      alert("Visit report submitted successfully!")
      navigate("/sales")
    } catch (error) {
      console.error("Error submitting report:", error)
      alert("Error submitting report. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
        <h2 className="text-xl font-semibold text-muted-foreground mb-4">Task not found</h2>
        <Button onClick={() => navigate("/sales")} className="bg-primary hover:bg-primary/90">
          Back to Dashboard
        </Button>
      </div>
    )
  }

  const isReadOnly = task.status === "completed" && existingReport
  const isInProgress = task.status === "in_progress"

  // Map positions for display
  const mapPositions = []
  if (checkInLocation) {
    mapPositions.push({
      lat: checkInLocation.lat,
      lng: checkInLocation.lng,
      title: "Check-in Location",
      description: `${company?.name} - ${formatDate(visitStartTime || new Date())}`,
    })
  }
  if (checkOutLocation && checkOutLocation !== checkInLocation) {
    mapPositions.push({
      lat: checkOutLocation.lat,
      lng: checkOutLocation.lng,
      title: "Check-out Location",
      description: `Visit completed - ${formatDate(new Date())}`,
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/sales")} className="hover:bg-muted/50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight">{isReadOnly ? "Visit Report" : "Visit Form"}</h1>
            <p className="text-xl text-muted-foreground">
              {isReadOnly ? "View submitted report" : "Complete your visit and submit report"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {task.status === "completed" && (
            <Badge variant="default" className="bg-success text-success-foreground">
              <CheckCircle className="mr-1 h-3 w-3" />
              Completed
            </Badge>
          )}
          {isInProgress && (
            <Badge variant="default" className="bg-warning text-warning-foreground">
              <Clock className="mr-1 h-3 w-3" />
              In Progress
            </Badge>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Task Information */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Visit Details
              </CardTitle>
              <CardDescription>Pre-filled information from your assigned task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-lg">{company?.name}</div>
                      <div className="text-muted-foreground">
                        {company?.address.line1}, {company?.address.city}, {company?.address.state}{" "}
                        {company?.address.pincode}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const address = `${company?.address.line1}, ${company?.address.city}, ${company?.address.state} ${company?.address.pincode}`
                        const encodedAddress = encodeURIComponent(address)
                        window.open(`https://maps.google.com/maps?daddr=${encodedAddress}`, "_blank")
                      }}
                    >
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <Label className="text-sm text-muted-foreground">Scheduled Date</Label>
                    <div className="font-medium">{formatDate(task.dueAt)}</div>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <Label className="text-sm text-muted-foreground">Scheduled Time</Label>
                    <div className="font-medium">{formatTime(task.dueAt)}</div>
                  </div>
                </div>

                {task.contactHint?.name && (
                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <Label className="text-sm text-muted-foreground mb-2 block">Expected Contact</Label>
                    <div className="space-y-2">
                      <div className="font-medium">
                        {task.contactHint.name}
                        {task.contactHint.role && ` (${task.contactHint.role})`}
                      </div>
                      <div className="flex items-center gap-4">
                        {task.contactHint.phone && (
                          <a
                            href={`tel:${task.contactHint.phone}`}
                            className="flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <Phone className="h-3 w-3" />
                            {task.contactHint.phone}
                          </a>
                        )}
                        {task.contactHint.email && (
                          <a
                            href={`mailto:${task.contactHint.email}`}
                            className="flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <Mail className="h-3 w-3" />
                            {task.contactHint.email}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {(task.through || task.notes) && (
                  <div className="space-y-3">
                    {task.through && (
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <Label className="text-sm text-muted-foreground">Through</Label>
                        <div className="text-sm">{task.through}</div>
                      </div>
                    )}
                    {task.notes && (
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <Label className="text-sm text-muted-foreground">Task Notes</Label>
                        <div className="text-sm">{task.notes}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* GPS Location & Map */}
          <div className="space-y-6">
            {/* Check-in Status */}
            {checkInLocation && (
              <Card className="glass-effect border-l-4 border-l-success">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-success">
                    <CheckCircle className="h-5 w-5" />
                    Checked In
                  </CardTitle>
                  <CardDescription>{visitStartTime && `at ${formatTime(visitStartTime)}`}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Location: {checkInLocation.lat.toFixed(6)}, {checkInLocation.lng.toFixed(6)}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Check-out GPS Capture */}
            {!isReadOnly && isInProgress && (
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Check-out Location
                  </CardTitle>
                  <CardDescription>Capture your location when leaving the visit</CardDescription>
                </CardHeader>
                <CardContent>
                  <GPSCapture onLocationCapture={handleCheckOutGPS} autoCapture={false} className="w-full" />
                </CardContent>
              </Card>
            )}

            {/* Map Display */}
            {mapPositions.length > 0 && (
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-info" />
                    Visit Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Map positions={mapPositions} height="300px" />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Visit Details & Contact Information */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Visit Details & Contact Information
            </CardTitle>
            <CardDescription>Fill in the details from your visit as per the requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Project Name & Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  placeholder="Enter project name"
                  value={formData.projectName}
                  onChange={(e) => handleInputChange("projectName", e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Visit address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* POC & Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="actualContactName">POC (Point of Contact)</Label>
                <Input
                  id="actualContactName"
                  placeholder="Full name"
                  value={formData.actualContactName}
                  onChange={(e) => handleInputChange("actualContactName", e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="e.g., IT, Sales, Marketing"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Contact Phone & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="actualContactPhone">Contact (Phone)</Label>
                <Input
                  id="actualContactPhone"
                  placeholder="+91-XXXXXXXXXX"
                  value={formData.actualContactPhone}
                  onChange={(e) => handleInputChange("actualContactPhone", e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actualContactEmail">Email</Label>
                <Input
                  id="actualContactEmail"
                  type="email"
                  placeholder="email@company.com"
                  value={formData.actualContactEmail}
                  onChange={(e) => handleInputChange("actualContactEmail", e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Contact Role & Product Pitched */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="actualContactRole">Designation</Label>
                <Input
                  id="actualContactRole"
                  placeholder="e.g., CEO, Manager"
                  value={formData.actualContactRole}
                  onChange={(e) => handleInputChange("actualContactRole", e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productPitched">Product Pitched</Label>
                <Input
                  id="productPitched"
                  placeholder="Product or service presented"
                  value={formData.productPitched}
                  onChange={(e) => handleInputChange("productPitched", e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Meeting Type */}
            <div className="space-y-2">
              <Label htmlFor="meetingType">Meeting (Type/Status)</Label>
              <Select
                id="meetingType"
                value={formData.meetingType}
                onChange={(e) => handleInputChange("meetingType", e.target.value)}
                disabled={isReadOnly}
              >
                <option value="">Select meeting type/status</option>
                <option value="in_person">In-Person Meeting</option>
                <option value="virtual">Virtual Meeting</option>
                <option value="phone_call">Phone Call</option>
                <option value="presentation">Product Presentation</option>
                <option value="demo">Product Demo</option>
                <option value="follow_up">Follow-up Meeting</option>
                <option value="initial_contact">Initial Contact</option>
                <option value="negotiation">Negotiation</option>
                <option value="closing">Closing Meeting</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Visit Outcome */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Visit Outcome & Remarks
            </CardTitle>
            <CardDescription>Record the results and next steps from your visit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="outcome">Outcome *</Label>
                <Select
                  id="outcome"
                  value={formData.outcome}
                  onChange={(e) => handleInputChange("outcome", e.target.value)}
                  required
                  disabled={isReadOnly}
                >
                  <option value="">Select outcome</option>
                  <option value="met">Met - Successful meeting</option>
                  <option value="not_available">Not Available</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="closed_win">Closed Won</option>
                  <option value="closed_lost">Closed Lost</option>
                  <option value="follow_up">Follow Up Required</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderValue">Order Value (₹)</Label>
                <Input
                  id="orderValue"
                  type="number"
                  placeholder="0"
                  value={formData.orderValue}
                  onChange={(e) => handleInputChange("orderValue", e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nextFollowUpDate">Next Follow-up Date</Label>
                <Input
                  id="nextFollowUpDate"
                  type="date"
                  value={formData.nextFollowUpDate}
                  onChange={(e) => handleInputChange("nextFollowUpDate", e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitDuration">Visit Duration (minutes)</Label>
                <Input
                  id="visitDuration"
                  type="number"
                  placeholder="Auto-calculated"
                  value={formData.visitDuration}
                  onChange={(e) => handleInputChange("visitDuration", e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Remark</Label>
              <textarea
                id="notes"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Detailed notes about the visit, discussion points, client feedback, etc."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                disabled={isReadOnly}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        {!isReadOnly && (
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/sales")}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.outcome || !checkOutLocation}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Check Out & Submit Report
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
