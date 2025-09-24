"use client"

import { useMemo } from "react"
import { useDataStore } from "@/store/useDataStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { formatDate, formatTime, getStatusVariant, getStatusLabel } from "@/utils/format"
import { ClipboardList } from "lucide-react"
import dayjs from "dayjs"

export default function AllTasks() {
  const { tasks, users, companies, visitReports } = useDataStore()

  // Get tasks with related data
  const tasksWithDetails = useMemo(() => {
    return tasks
      .map((task) => {
        const company = companies.find((c) => c.id === task.companyId)
        const salesperson = users.find((u) => u.id === task.salespersonId)
        const assignedBy = users.find((u) => u.id === task.assignedByAdminId)
        const report = visitReports.find((r) => r.taskId === task.id)

        return {
          ...task,
          company,
          salesperson,
          assignedBy,
          report,
          companyName: company?.name || "",
          salespersonName: salesperson?.name || "",
          cityName: company?.address.city || "",
          contactName: task.contactHint?.name || "",
          outcome: report?.outcome || "",
          orderValue: report?.orderValue || 0,
        }
      })
      .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)))
  }, [tasks, companies, users, visitReports])

  const columns = [
    {
      key: "dueAt",
      header: "Date & Time",
      render: (value) => (
        <div>
          <div className="font-medium">{formatDate(value)}</div>
          <div className="text-sm text-muted-foreground">{formatTime(value)}</div>
        </div>
      ),
    },
    {
      key: "companyName",
      header: "Company",
      filterable: true,
      render: (value, task) => (
        <div>
          <div className="font-medium">{task.company?.name}</div>
          <div className="text-sm text-muted-foreground">{task.company?.address.city}</div>
        </div>
      ),
    },
    {
      key: "salespersonName",
      header: "Salesperson",
      filterable: true,
      render: (value, task) => (
        <div>
          <div className="font-medium">{task.salesperson?.name}</div>
          <div className="text-sm text-muted-foreground">{task.salesperson?.phone}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      filterable: true,
      render: (value) => <Badge variant={getStatusVariant(value)}>{getStatusLabel(value)}</Badge>,
    },
    {
      key: "contactName",
      header: "Contact",
      filterable: true,
      render: (value, task) =>
        task.contactHint?.name ? (
          <div>
            <div className="font-medium">{task.contactHint.name}</div>
            {task.contactHint.role && <div className="text-sm text-muted-foreground">{task.contactHint.role}</div>}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "outcome",
      header: "Outcome",
      filterable: true,
      render: (value, task) =>
        task.report?.outcome ? (
          <Badge variant={getStatusVariant(task.report.outcome)}>{task.report.outcome.replace("_", " ")}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "orderValue",
      header: "Order Value",
      render: (value, task) =>
        task.report?.orderValue ? (
          <span className="font-medium">₹{task.report.orderValue.toLocaleString()}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (value, task) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">
            View
          </Button>
          {task.status === "assigned" && (
            <Button variant="outline" size="sm">
              Edit
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Tasks</h1>
          <p className="text-muted-foreground">Comprehensive view of all assigned tasks and their status</p>
        </div>
      </div>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="mr-2 h-5 w-5" />
            Tasks ({tasksWithDetails.length})
          </CardTitle>
          <CardDescription>
            {tasksWithDetails.length} task{tasksWithDetails.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={tasksWithDetails}
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
