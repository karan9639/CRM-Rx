"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useDataStore } from "@/store/useDataStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import GPSCapture from "@/components/common/GPSCapture";
import Map from "@/components/ui/map";
import { formatDate, formatTime } from "@/utils/format";
import {
  Clock,
  User,
  FileText,
  Save,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import dayjs from "dayjs";

export default function VisitForm() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tasks, companies, visitReports, updateTask, addVisitReport } =
    useDataStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);

  // Find the task and related data
  const task = tasks.find((t) => t.id === taskId);
  const company = companies.find((c) => c.id === task?.companyId);
  const existingReport = visitReports.find((r) => r.taskId === taskId);

  // Form state
  const [formData, setFormData] = useState({
    actualContactName: "",
    actualContactRole: "",
    actualContactPhone: "",
    actualContactEmail: "",
    outcome: "",
    orderValue: "",
    notes: "",
    nextFollowUpDate: "",
    addressCorrections: "",
  });

  // Load existing report data if available
  useEffect(() => {
    if (existingReport) {
      setFormData({
        actualContactName: existingReport.actualContact?.name || "",
        actualContactRole: existingReport.actualContact?.role || "",
        actualContactPhone: existingReport.actualContact?.phone || "",
        actualContactEmail: existingReport.actualContact?.email || "",
        outcome: existingReport.outcome || "",
        orderValue: existingReport.orderValue?.toString() || "",
        notes: existingReport.notes || "",
        nextFollowUpDate: existingReport.nextFollowUpAt
          ? dayjs(existingReport.nextFollowUpAt).format("YYYY-MM-DD")
          : "",
        addressCorrections: "",
      });

      // Set existing GPS location
      if (existingReport.checkIn?.gps) {
        setGpsLocation(existingReport.checkIn.gps);
      }
    } else if (task?.contactHint) {
      // Pre-fill with task contact hint
      setFormData((prev) => ({
        ...prev,
        actualContactName: task.contactHint.name || "",
        actualContactRole: task.contactHint.role || "",
        actualContactPhone: task.contactHint.phone || "",
        actualContactEmail: task.contactHint.email || "",
      }));
    }
  }, [existingReport, task]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGPSCapture = (location) => {
    setGpsLocation(location);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const reportData = {
        taskId,
        salespersonId: user.id,
        companyId: task.companyId,
        checkIn: existingReport?.checkIn || {
          at: new Date().toISOString(),
          gps: gpsLocation,
        },
        checkOut: {
          at: new Date().toISOString(),
          gps: gpsLocation,
        },
        actualContact: {
          name: formData.actualContactName || undefined,
          role: formData.actualContactRole || undefined,
          phone: formData.actualContactPhone || undefined,
          email: formData.actualContactEmail || undefined,
        },
        outcome: formData.outcome || undefined,
        orderValue: formData.orderValue
          ? Number.parseFloat(formData.orderValue)
          : undefined,
        notes: formData.notes || undefined,
        nextFollowUpAt: formData.nextFollowUpDate
          ? dayjs(formData.nextFollowUpDate).toISOString()
          : undefined,
      };

      if (existingReport) {
        // Update existing report (in a real app, you'd have an updateVisitReport function)
        console.log("Would update existing report:", reportData);
      } else {
        addVisitReport(reportData);
      }

      // Update task status to completed
      updateTask(taskId, { status: "completed" });

      alert("Visit report submitted successfully!");
      navigate("/sales");
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Error submitting report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!task) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-muted-foreground">
          Task not found
        </h2>
        <Button onClick={() => navigate("/sales")} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const isReadOnly = task.status === "completed" && existingReport;

  // Map positions for display
  const mapPositions = gpsLocation
    ? [
        {
          lat: gpsLocation.lat,
          lng: gpsLocation.lng,
          title: "Visit Location",
          description: `${company?.name} - ${formatDate(new Date())}`,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/sales")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isReadOnly ? "Visit Report" : "Visit Form"}
            </h1>
            <p className="text-muted-foreground">
              {isReadOnly
                ? "View submitted report"
                : "Complete your visit and submit report"}
            </p>
          </div>
        </div>
        {task.status === "completed" && (
          <Badge variant="success">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Visit Details
              </CardTitle>
              <CardDescription>
                Pre-filled information from your assigned task
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Company</Label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <div className="font-medium">{company?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {company?.address.line1}, {company?.address.city},{" "}
                    {company?.address.state} {company?.address.pincode}
                  </div>
                </div>
              </div>

              <div>
                <Label>Scheduled Time</Label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <div className="font-medium">
                    {formatDate(task.dueAt)} at {formatTime(task.dueAt)}
                  </div>
                </div>
              </div>

              {task.through && (
                <div>
                  <Label>Through</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <div className="text-sm">{task.through}</div>
                  </div>
                </div>
              )}

              {task.notes && (
                <div>
                  <Label>Task Notes</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <div className="text-sm">{task.notes}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* GPS Location */}
          <div className="space-y-4">
            <GPSCapture
              onLocationCapture={handleGPSCapture}
              autoCapture={!existingReport && !isReadOnly}
              className="w-full"
            />

            {/* Map Display */}
            {mapPositions.length > 0 && (
              <Map positions={mapPositions} height="200px" />
            )}
          </div>
        </div>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Actual Contact Met
            </CardTitle>
            <CardDescription>
              Update contact information based on who you actually met
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="actualContactName">Contact Name</Label>
                <Input
                  id="actualContactName"
                  placeholder="Full name"
                  value={formData.actualContactName}
                  onChange={(e) =>
                    handleInputChange("actualContactName", e.target.value)
                  }
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actualContactRole">Designation</Label>
                <Input
                  id="actualContactRole"
                  placeholder="e.g., CEO, Manager"
                  value={formData.actualContactRole}
                  onChange={(e) =>
                    handleInputChange("actualContactRole", e.target.value)
                  }
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actualContactPhone">Phone</Label>
                <Input
                  id="actualContactPhone"
                  placeholder="+91-XXXXXXXXXX"
                  value={formData.actualContactPhone}
                  onChange={(e) =>
                    handleInputChange("actualContactPhone", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleInputChange("actualContactEmail", e.target.value)
                  }
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visit Outcome */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Visit Outcome
            </CardTitle>
            <CardDescription>
              Record the results and next steps from your visit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  onChange={(e) =>
                    handleInputChange("orderValue", e.target.value)
                  }
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextFollowUpDate">Next Follow-up Date</Label>
              <Input
                id="nextFollowUpDate"
                type="date"
                value={formData.nextFollowUpDate}
                onChange={(e) =>
                  handleInputChange("nextFollowUpDate", e.target.value)
                }
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes & Observations</Label>
              <textarea
                id="notes"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Detailed notes about the visit, discussion points, client feedback, etc."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressCorrections">
                Address Corrections (if any)
              </Label>
              <Input
                id="addressCorrections"
                placeholder="Any corrections to the company address"
                value={formData.addressCorrections}
                onChange={(e) =>
                  handleInputChange("addressCorrections", e.target.value)
                }
                disabled={isReadOnly}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        {!isReadOnly && (
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/sales")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.outcome || !gpsLocation}
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Check Out & Submit
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
