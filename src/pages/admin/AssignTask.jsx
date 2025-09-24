"use client"

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useDataStore } from "@/store/useDataStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { UserPlus, Building2, User, Edit } from "lucide-react"
import dayjs from "dayjs"

export default function AssignTask() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { users, companies, tasks, addTask, addCompany, updateTask } = useDataStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showNewCompany, setShowNewCompany] = useState(false)

  // Check if we're editing an existing task
  const editTaskId = searchParams.get("edit")
  const preSelectedCompanyId = searchParams.get("companyId")
  const preSelectedSalespersonId = searchParams.get("salespersonId")
  const isEditing = !!editTaskId

  // Find the task being edited
  const editingTask = isEditing ? tasks.find((t) => t.id === editTaskId) : null

  // Form state
  const [formData, setFormData] = useState({
    salespersonId: "",
    companyId: "",
    dueDate: dayjs().format("YYYY-MM-DD"),
    dueTime: "10:00",
    contactName: "",
    contactRole: "",
    contactPhone: "",
    contactEmail: "",
    through: "",
    notes: "",
    // New company fields
    newCompanyName: "",
    newCompanyAddress: "",
    newCompanyCity: "",
    newCompanyState: "",
    newCompanyPincode: "",
  })

  // Load existing task data if editing
  useEffect(() => {
    if (editingTask) {
      const dueDate = dayjs(editingTask.dueAt)
      setFormData({
        salespersonId: editingTask.salespersonId,
        companyId: editingTask.companyId,
        dueDate: dueDate.format("YYYY-MM-DD"),
        dueTime: dueDate.format("HH:mm"),
        contactName: editingTask.contactHint?.name || "",
        contactRole: editingTask.contactHint?.role || "",
        contactPhone: editingTask.contactHint?.phone || "",
        contactEmail: editingTask.contactHint?.email || "",
        through: editingTask.through || "",
        notes: editingTask.notes || "",
        newCompanyName: "",
        newCompanyAddress: "",
        newCompanyCity: "",
        newCompanyState: "",
        newCompanyPincode: "",
      })
    } else {
      // Pre-fill with URL parameters if provided
      if (preSelectedCompanyId) {
        setFormData((prev) => ({ ...prev, companyId: preSelectedCompanyId }))
      }
      if (preSelectedSalespersonId) {
        setFormData((prev) => ({ ...prev, salespersonId: preSelectedSalespersonId }))
      }
    }
  }, [editingTask, preSelectedCompanyId, preSelectedSalespersonId])

  const salesUsers = users.filter((user) => user.role === "sales")

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let companyId = formData.companyId

      // Create new company if needed
      if (showNewCompany) {
        const newCompany = {
          name: formData.newCompanyName,
          address: {
            line1: formData.newCompanyAddress,
            city: formData.newCompanyCity,
            state: formData.newCompanyState,
            pincode: formData.newCompanyPincode,
          },
          contacts: [],
          notes: "",
        }
        addCompany(newCompany)
        companyId = Date.now().toString() // This would be the ID assigned by addCompany
      }

      // Create task
      const dueAt = dayjs(`${formData.dueDate} ${formData.dueTime}`).toISOString()

      const taskData = {
        companyId,
        salespersonId: formData.salespersonId,
        dueAt,
        assignedByAdminId: "1", // Current admin user
        contactHint: {
          name: formData.contactName || undefined,
          role: formData.contactRole || undefined,
          phone: formData.contactPhone || undefined,
          email: formData.contactEmail || undefined,
        },
        through: formData.through || undefined,
        notes: formData.notes || undefined,
      }

      if (isEditing) {
        // Update existing task
        updateTask(editTaskId, taskData)
        alert("Task updated successfully!")
      } else {
        // Create new task
        addTask(taskData)
        alert("Task assigned successfully!")
      }

      // Navigate back to dashboard
      navigate("/admin")
    } catch (error) {
      console.error("Error saving task:", error)
      alert("Error saving task. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{isEditing ? "Edit Task" : "Assign New Task"}</h1>
        <p className="text-muted-foreground">
          {isEditing ? "Update the task details" : "Create and assign a visit task to your sales team"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {isEditing ? <Edit className="mr-2 h-5 w-5" /> : <UserPlus className="mr-2 h-5 w-5" />}
                Task Assignment
              </CardTitle>
              <CardDescription>Select salesperson and schedule the visit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="salesperson">Salesperson *</Label>
                <Select
                  id="salesperson"
                  value={formData.salespersonId}
                  onChange={(e) => handleInputChange("salespersonId", e.target.value)}
                  required
                >
                  <option value="">Select a salesperson</option>
                  {salesUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Visit Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange("dueDate", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueTime">Visit Time *</Label>
                  <Input
                    id="dueTime"
                    type="time"
                    value={formData.dueTime}
                    onChange={(e) => handleInputChange("dueTime", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="through">Through (Optional)</Label>
                <Input
                  id="through"
                  placeholder="e.g., LinkedIn connection, referral"
                  value={formData.through}
                  onChange={(e) => handleInputChange("through", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Additional instructions or context for the visit"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Company Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Company Details
              </CardTitle>
              <CardDescription>Select existing company or add a new one</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant={!showNewCompany ? "default" : "outline"}
                  onClick={() => setShowNewCompany(false)}
                >
                  Existing Company
                </Button>
                <Button
                  type="button"
                  variant={showNewCompany ? "default" : "outline"}
                  onClick={() => setShowNewCompany(true)}
                >
                  + Add New Company
                </Button>
              </div>

              {!showNewCompany ? (
                <div className="space-y-2">
                  <Label htmlFor="company">Select Company *</Label>
                  <Select
                    id="company"
                    value={formData.companyId}
                    onChange={(e) => handleInputChange("companyId", e.target.value)}
                    required={!showNewCompany}
                  >
                    <option value="">Select a company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name} - {company.address.city}
                      </option>
                    ))}
                  </Select>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newCompanyName">Company Name *</Label>
                    <Input
                      id="newCompanyName"
                      placeholder="Enter company name"
                      value={formData.newCompanyName}
                      onChange={(e) => handleInputChange("newCompanyName", e.target.value)}
                      required={showNewCompany}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newCompanyAddress">Address *</Label>
                    <Input
                      id="newCompanyAddress"
                      placeholder="Street address"
                      value={formData.newCompanyAddress}
                      onChange={(e) => handleInputChange("newCompanyAddress", e.target.value)}
                      required={showNewCompany}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newCompanyCity">City *</Label>
                      <Input
                        id="newCompanyCity"
                        placeholder="City"
                        value={formData.newCompanyCity}
                        onChange={(e) => handleInputChange("newCompanyCity", e.target.value)}
                        required={showNewCompany}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newCompanyState">State *</Label>
                      <Input
                        id="newCompanyState"
                        placeholder="State"
                        value={formData.newCompanyState}
                        onChange={(e) => handleInputChange("newCompanyState", e.target.value)}
                        required={showNewCompany}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newCompanyPincode">Pincode *</Label>
                    <Input
                      id="newCompanyPincode"
                      placeholder="Pincode"
                      value={formData.newCompanyPincode}
                      onChange={(e) => handleInputChange("newCompanyPincode", e.target.value)}
                      required={showNewCompany}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Contact Information (Optional)
            </CardTitle>
            <CardDescription>Provide contact details if known</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  placeholder="Full name"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange("contactName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactRole">Designation</Label>
                <Input
                  id="contactRole"
                  placeholder="e.g., CEO, Manager"
                  value={formData.contactRole}
                  onChange={(e) => handleInputChange("contactRole", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  placeholder="+91-XXXXXXXXXX"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="email@company.com"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate("/admin")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
            {isSubmitting ? (isEditing ? "Updating..." : "Assigning...") : isEditing ? "Update Task" : "Assign Task"}
          </Button>
        </div>
      </form>
    </div>
  )
}
