"use client"

import { useState } from "react"
import { useDataStore } from "@/store/useDataStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SettingsIcon, Database, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react"

export default function Settings() {
  const { users, companies, tasks, visitReports, resetData } = useDataStore()
  const [isResetting, setIsResetting] = useState(false)

  const handleResetData = async () => {
    if (window.confirm("Are you sure you want to reset all data? This action cannot be undone.")) {
      setIsResetting(true)
      try {
        resetData()
        alert("Data has been reset successfully!")
      } catch (error) {
        console.error("Error resetting data:", error)
        alert("Error resetting data. Please try again.")
      } finally {
        setIsResetting(false)
      }
    }
  }

  const dataStats = {
    users: users.length,
    companies: companies.length,
    tasks: tasks.length,
    visitReports: visitReports.length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage system settings and data</p>
      </div>

      {/* Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Data Overview
          </CardTitle>
          <CardDescription>Current data statistics in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{dataStats.users}</div>
              <div className="text-sm text-muted-foreground">Users</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{dataStats.companies}</div>
              <div className="text-sm text-muted-foreground">Companies</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{dataStats.tasks}</div>
              <div className="text-sm text-muted-foreground">Tasks</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{dataStats.visitReports}</div>
              <div className="text-sm text-muted-foreground">Visit Reports</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIcon className="mr-2 h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription>Configure system behavior and requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <div className="font-medium">GPS Requirement</div>
              <div className="text-sm text-muted-foreground">Require GPS location for visit submissions</div>
            </div>
            <Badge variant="success">
              <CheckCircle className="mr-1 h-3 w-3" />
              Enabled
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <div className="font-medium">Auto Check-in</div>
              <div className="text-sm text-muted-foreground">Automatically check-in when visit form is opened</div>
            </div>
            <Badge variant="outline">Disabled</Badge>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <div className="font-medium">Visit Reminders</div>
              <div className="text-sm text-muted-foreground">Send notifications for upcoming visits</div>
            </div>
            <Badge variant="success">
              <CheckCircle className="mr-1 h-3 w-3" />
              Enabled
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="mr-2 h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>Reset or manage system data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-yellow-800 dark:text-yellow-200">Reset All Data</div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  This will delete all existing data and restore the system to its initial state with fresh seed data.
                  This action cannot be undone.
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-3"
                  onClick={handleResetData}
                  disabled={isResetting}
                >
                  {isResetting ? "Resetting..." : "Reset All Data"}
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 border border-border rounded-lg">
            <div className="font-medium mb-2">Data Export</div>
            <div className="text-sm text-muted-foreground mb-3">
              Export all system data for backup or analysis purposes.
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Export Users
              </Button>
              <Button variant="outline" size="sm">
                Export Companies
              </Button>
              <Button variant="outline" size="sm">
                Export Tasks
              </Button>
              <Button variant="outline" size="sm">
                Export Reports
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Application details and version information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Application Version:</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Build Date:</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Storage:</span>
            <span>Local Storage</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GPS Support:</span>
            <span>{navigator.geolocation ? "Available" : "Not Available"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
