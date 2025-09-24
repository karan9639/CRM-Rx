"use client"

import { useNavigate } from "react-router-dom"
import { useDataStore } from "@/store/useDataStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Users, UserPlus, Phone, Mail, Calendar } from "lucide-react"
import { useMemo } from "react"
import { isToday } from "@/utils/format"

export default function UsersList() {
  const navigate = useNavigate()
  const { users, tasks } = useDataStore()

  // Get sales users only
  const salesUsers = users.filter((user) => user.role === "sales")

  // Calculate user statistics
  const userStats = useMemo(() => {
    return salesUsers.map((user) => {
      const userTasks = tasks.filter((task) => task.salespersonId === user.id)
      const todayTasks = userTasks.filter((task) => isToday(task.dueAt))
      const completedTasks = userTasks.filter((task) => task.status === "completed")

      return {
        ...user,
        totalTasks: userTasks.length,
        todayTasks: todayTasks.length,
        completedTasks: completedTasks.length,
        completionRate: userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0,
      }
    })
  }, [salesUsers, tasks])

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (value, user) => (
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-muted-foreground">Sales Representative</div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      sortable: false,
      render: (value, user) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <Phone className="mr-2 h-3 w-3" />
            {user.phone}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="mr-2 h-3 w-3" />
            {user.email}
          </div>
        </div>
      ),
    },
    {
      key: "todayTasks",
      header: "Today's Tasks",
      filterable: true,
      render: (value) => <Badge variant={value > 0 ? "default" : "outline"}>{value}</Badge>,
    },
    {
      key: "totalTasks",
      header: "Total Tasks",
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: "completedTasks",
      header: "Completed",
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: "completionRate",
      header: "Success Rate",
      filterable: true,
      render: (value) => (
        <Badge variant={value >= 80 ? "success" : value >= 60 ? "warning" : value > 0 ? "destructive" : "outline"}>
          {value}%
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (value, user) => (
        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-primary/10 hover:text-primary hover:border-primary transition-all duration-200 bg-transparent text-xs sm:text-sm"
            onClick={() => navigate(`/admin/assign-task?salespersonId=${user.id}`)}
          >
            Assign Task
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-accent/50 transition-all duration-200 text-xs sm:text-sm"
            onClick={() => navigate(`/admin/users/${user.id}/history`)}
          >
            View History
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Sales Team</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage your sales representatives and their performance
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/assign-task")}
          className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Assign Task
        </Button>
      </div>

      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales Reps</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesUsers.length}</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.reduce((sum, user) => sum + user.todayTasks, 0)}</div>
            <p className="text-xs text-muted-foreground">Assigned for today</p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesUsers.length > 0
                ? Math.round(userStats.reduce((sum, user) => sum + user.completionRate, 0) / salesUsers.length)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Team average</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Team Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Overview of all sales representatives and their current performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <DataTable
              data={userStats}
              columns={columns}
              searchable={true}
              filterable={true}
              sortable={true}
              exportable={true}
              pageSize={10}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
