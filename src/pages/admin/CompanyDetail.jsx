"use client"

import { useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDataStore } from "@/store/useDataStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Map from "@/components/ui/map"
import { formatDate, formatTime, formatCurrency, getStatusVariant, getStatusLabel } from "@/utils/format"
import { ArrowLeft, Building2, MapPin, Phone, Mail, Calendar, User, FileText } from "lucide-react"
import dayjs from "dayjs"

export default function CompanyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { companies, tasks, users, visitReports } = useDataStore()

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

  // Map positions from visit reports
  const mapPositions = useMemo(() => {
    return companyReports
      .filter((report) => report.checkIn?.gps)
      .map((report, index) => ({
        lat: report.checkIn.gps.lat,
        lng: report.checkIn.gps.lng,
        title: `Visit ${index + 1}`,
        description: `${formatDate(report.submittedAt)} - ${report.outcome || "No outcome"}`,
      }))
  }, [companyReports])

  // Company statistics
  const stats = useMemo(() => {
    const totalTasks = companyTasks.length
    const completedTasks = companyTasks.filter((task) => task.status === "completed").length
    const totalValue = companyReports.reduce((sum, report) => sum + (report.orderValue || 0), 0)
    const wonDeals = companyReports.filter((report) => report.outcome === "closed_win").length

    return {
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalValue,
      wonDeals,
    }
  }, [companyTasks, companyReports])

  if (!company) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-muted-foreground">Company not found</h2>
        <Button onClick={() => navigate("/admin/companies")} className="mt-4">
          Back to Companies
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/admin/companies")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{company.name}</h1>
            <p className="text-muted-foreground flex items-center">
              <MapPin className="mr-1 h-4 w-4" />
              {company.address.city}, {company.address.state}
            </p>
          </div>
        </div>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Assign Task
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Information */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Company Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Address</div>
                <div className="text-sm">
                  <div>{company.address.line1}</div>
                  <div>
                    {company.address.city}, {company.address.state}
                  </div>
                  <div>{company.address.pincode}</div>
                </div>
              </div>

              {company.contacts && company.contacts.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Contacts</div>
                  <div className="space-y-3">
                    {company.contacts.map((contact) => (
                      <div key={contact.id} className="p-3 bg-muted rounded-md">
                        <div className="flex items-center mb-1">
                          <User className="mr-2 h-4 w-4" />
                          <span className="font-medium">{contact.name}</span>
                          {contact.role && <span className="ml-2 text-muted-foreground">({contact.role})</span>}
                        </div>
                        {contact.phone && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="mr-2 h-3 w-3" />
                            {contact.phone}
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="mr-2 h-3 w-3" />
                            {contact.email}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {company.notes && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Notes</div>
                  <div className="text-sm p-3 bg-muted rounded-md">{company.notes}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-md">
                  <div className="text-2xl font-bold text-primary">{stats.totalTasks}</div>
                  <div className="text-xs text-muted-foreground">Total Tasks</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-md">
                  <div className="text-2xl font-bold text-green-500">{stats.completedTasks}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-md">
                  <div className="text-2xl font-bold text-blue-500">{stats.completionRate}%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-md">
                  <div className="text-2xl font-bold text-purple-500">{stats.wonDeals}</div>
                  <div className="text-xs text-muted-foreground">Won Deals</div>
                </div>
              </div>
              {stats.totalValue > 0 && (
                <div className="text-center p-3 bg-muted rounded-md">
                  <div className="text-xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</div>
                  <div className="text-xs text-muted-foreground">Total Order Value</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Visit Locations Map */}
          {mapPositions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Visit Locations</h3>
              <Map positions={mapPositions} height="250px" />
            </div>
          )}
        </div>

        {/* Visit History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Visit History
              </CardTitle>
              <CardDescription>Complete timeline of all visits and tasks for this company</CardDescription>
            </CardHeader>
            <CardContent>
              {tasksWithDetails.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No visits yet</h3>
                  <p className="text-sm text-muted-foreground">This company has no assigned tasks or visits.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Salesperson</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>GPS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasksWithDetails.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{formatDate(task.dueAt)}</div>
                            <div className="text-sm text-muted-foreground">{formatTime(task.dueAt)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.salesperson?.name}</div>
                            <div className="text-sm text-muted-foreground">{task.salesperson?.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(task.status)}>{getStatusLabel(task.status)}</Badge>
                        </TableCell>
                        <TableCell>
                          {task.report?.actualContact?.name || task.contactHint?.name ? (
                            <div>
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
                            <Badge variant={getStatusVariant(task.report.outcome)}>
                              {task.report.outcome.replace("_", " ")}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {task.report?.orderValue ? (
                            <span className="font-medium">{formatCurrency(task.report.orderValue)}</span>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
