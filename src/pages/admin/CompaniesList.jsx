"use client"

import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useDataStore } from "@/store/useDataStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { formatDate, formatRelativeTime } from "@/utils/format"
import { Building2, Search, MapPin, Phone, Mail, Calendar, Plus, Eye } from "lucide-react"
import dayjs from "dayjs"

export default function CompaniesList() {
  const navigate = useNavigate()
  const { companies, tasks, visitReports } = useDataStore()
  const [searchTerm, setSearchTerm] = useState("")

  // Enhance companies with task and visit data
  const companiesWithData = useMemo(() => {
    return companies.map((company) => {
      const companyTasks = tasks.filter((task) => task.companyId === company.id)
      const companyReports = visitReports.filter((report) => report.companyId === company.id)

      // Find next scheduled visit
      const upcomingTasks = companyTasks
        .filter((task) => task.status !== "completed" && dayjs(task.dueAt).isAfter(dayjs()))
        .sort((a, b) => dayjs(a.dueAt).diff(dayjs(b.dueAt)))

      // Find last completed visit
      const completedReports = companyReports
        .filter((report) => report.submittedAt)
        .sort((a, b) => dayjs(b.submittedAt).diff(dayjs(a.submittedAt)))

      const lastVisit = completedReports[0]
      const nextVisit = upcomingTasks[0]

      return {
        ...company,
        totalTasks: companyTasks.length,
        totalVisits: companyReports.length,
        lastVisit,
        nextVisit,
        lastVisitOutcome: lastVisit?.outcome,
      }
    })
  }, [companies, tasks, visitReports])

  // Filter companies
  const filteredCompanies = useMemo(() => {
    if (!searchTerm) return companiesWithData

    return companiesWithData.filter(
      (company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.address.state.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [companiesWithData, searchTerm])

  const getOutcomeVariant = (outcome) => {
    switch (outcome) {
      case "closed_win":
        return "success"
      case "closed_lost":
        return "destructive"
      case "follow_up":
        return "warning"
      case "rescheduled":
        return "warning"
      default:
        return "outline"
    }
  }

  const getOutcomeLabel = (outcome) => {
    switch (outcome) {
      case "closed_win":
        return "Won"
      case "closed_lost":
        return "Lost"
      case "follow_up":
        return "Follow Up"
      case "rescheduled":
        return "Rescheduled"
      case "met":
        return "Met"
      case "not_available":
        return "Not Available"
      default:
        return outcome
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Companies</h1>
          <p className="text-muted-foreground">Manage your client companies and view visit history</p>
        </div>
        <Button onClick={() => navigate("/admin/assign-task")} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies by name, city, or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No companies found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms." : "Start by adding your first company."}
            </p>
          </div>
        ) : (
          filteredCompanies.map((company) => (
            <Card key={company.id} className="hover:bg-accent/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="mr-1 h-3 w-3" />
                      {company.address.city}, {company.address.state}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/companies/${company.id}`)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Address */}
                <div className="text-sm text-muted-foreground">
                  <div>{company.address.line1}</div>
                  <div>
                    {company.address.city}, {company.address.state} {company.address.pincode}
                  </div>
                </div>

                {/* Contacts */}
                {company.contacts && company.contacts.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Primary Contact:</div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <span className="font-medium">{company.contacts[0].name}</span>
                        {company.contacts[0].role && <span className="ml-2">({company.contacts[0].role})</span>}
                      </div>
                      {company.contacts[0].phone && (
                        <div className="flex items-center mt-1">
                          <Phone className="mr-1 h-3 w-3" />
                          {company.contacts[0].phone}
                        </div>
                      )}
                      {company.contacts[0].email && (
                        <div className="flex items-center mt-1">
                          <Mail className="mr-1 h-3 w-3" />
                          {company.contacts[0].email}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Visit Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{company.totalVisits}</span>
                    <span className="text-muted-foreground ml-1">visits</span>
                  </div>
                  <div>
                    <span className="font-medium">{company.totalTasks}</span>
                    <span className="text-muted-foreground ml-1">tasks</span>
                  </div>
                </div>

                {/* Last Visit */}
                {company.lastVisit && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Last Visit:</div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {formatRelativeTime(company.lastVisit.submittedAt)}
                      </div>
                      {company.lastVisitOutcome && (
                        <Badge variant={getOutcomeVariant(company.lastVisitOutcome)} className="text-xs">
                          {getOutcomeLabel(company.lastVisitOutcome)}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Next Visit */}
                {company.nextVisit && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Next Visit:</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-3 w-3" />
                      {formatDate(company.nextVisit.dueAt)}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {company.notes && (
                  <div className="text-sm text-muted-foreground border-t pt-3">
                    <div className="font-medium mb-1">Notes:</div>
                    <div className="line-clamp-2">{company.notes}</div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent hover:bg-primary/10 hover:text-primary hover:border-primary transition-all duration-200"
                    onClick={() => navigate(`/admin/assign-task?companyId=${company.id}`)}
                  >
                    Assign Task
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 hover:bg-accent/50 transition-all duration-200"
                    onClick={() => navigate(`/admin/companies/${company.id}`)}
                  >
                    View History
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
