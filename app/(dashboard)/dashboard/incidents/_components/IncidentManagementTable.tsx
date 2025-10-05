"use client";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Incident, IncidentStatus, IncidentSeverity, IncidentPriority, Department, User, IncidentCategory } from "@prisma/client";
// import { Button } from "@/components/ui/button";
// import { useState, useEffect } from "react";
// import { Badge } from "@/components/ui/badge";
// import { getBadgeVariantForStatus } from "@/lib/getBadgeVariantForStatus";
// import Link from "next/link";
// import { useRouter, useSearchParams } from "next/navigation"; // New imports
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { ChevronUp, ChevronDown } from "lucide-react"; // For sorting icons
// import { getDepartments, getAllUsers } from "@/app/lib/actions"; // To get filter options

// type IncidentWithRelations = Incident & {
//   reporter: User;
//   assignee: User | null;
//   department: Department;
//   category: IncidentCategory;
// };

"use client";
interface IncidentManagementTableProps {
  incidents: IncidentWithRelations[];
  totalIncidents: number;
}

// app/(dashboard)/dashboard/incidents/_components/IncidentManagementTable.tsx

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Incident,
  IncidentStatus,
  IncidentSeverity,
  IncidentPriority,
  Department,
  User,
  IncidentCategory,
} from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { getBadgeVariantForStatus } from "@/lib/getBadgeVariantForStatus";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  getDepartments,
  getAllUsers,
  getAllIncidents,
} from "@/app/lib/actions";

type IncidentWithRelations = Incident & {
  reporter: User;
  assignee: User | null;
  department: Department;
  category: IncidentCategory;
};

interface IncidentManagementTableProps {
  incidents: IncidentWithRelations[];
  totalIncidents: number;
}

export const IncidentManagementTable = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [incidents, setIncidents] = useState<IncidentWithRelations[]>([]);
  const [totalIncidents, setTotalIncidents] = useState(0);
  const [loadingIncidents, setLoadingIncidents] = useState(true);

  // State for filters
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | "all">(
    (searchParams.get("status") as IncidentStatus) || "all"
  );
  const [severityFilter, setSeverityFilter] = useState<
    IncidentSeverity | "all"
  >((searchParams.get("severity") as IncidentSeverity) || "all");
  const [priorityFilter, setPriorityFilter] = useState<
    IncidentPriority | "all"
  >((searchParams.get("priority") as IncidentPriority) || "all");
  const [departmentFilter, setDepartmentFilter] = useState<string | "all">(
    searchParams.get("departmentId") || "all"
  );
  const [assigneeFilter, setAssigneeFilter] = useState<string | "all">(
    searchParams.get("assigneeId") || "all"
  );
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );

  // State for sorting
  const [sortBy, setSortBy] = useState(
    searchParams.get("orderBy") || "createdAt"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    (searchParams.get("orderDirection") as "asc" | "desc") || "desc"
  );

  // State for pagination
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const pageSize = 10; // Hardcoded for now, could be dynamic
  const totalPages = Math.ceil(totalIncidents / pageSize);

  // Options for filters
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getDepartments().then(setDepartments);
    getAllUsers().then((res) => setUsers(res));
  }, []);

  // Fetch incidents when URL params change
  useEffect(() => {
    const fetchIncidents = async () => {
      setLoadingIncidents(true);
      const params = {
        status: statusFilter !== "all" ? statusFilter : undefined,
        severity: severityFilter !== "all" ? severityFilter : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
        departmentId: departmentFilter !== "all" ? departmentFilter : undefined,
        assigneeId: assigneeFilter !== "all" ? assigneeFilter : undefined,
        search: searchTerm || undefined,
        orderBy: sortBy,
        orderDirection: sortDirection,
        page: currentPage,
        pageSize: pageSize,
      };
      const {
        incidents: fetchedIncidents,
        totalIncidents: fetchedTotalIncidents,
      } = await getAllIncidents(params);
      setIncidents(fetchedIncidents as IncidentWithRelations[]);
      setTotalIncidents(fetchedTotalIncidents);
      setLoadingIncidents(false);
    };
    fetchIncidents();
  }, [
    statusFilter,
    severityFilter,
    priorityFilter,
    departmentFilter,
    assigneeFilter,
    searchTerm,
    sortBy,
    sortDirection,
    currentPage,
    pageSize,
  ]);

  // Update URL params when filters, sorting, or pagination change
  useEffect(() => {
    const params = new URLSearchParams();

    if (statusFilter !== "all") params.set("status", statusFilter);
    if (severityFilter !== "all") params.set("severity", severityFilter);
    if (priorityFilter !== "all") params.set("priority", priorityFilter);
    if (departmentFilter !== "all")
      params.set("departmentId", departmentFilter);
    if (assigneeFilter !== "all") params.set("assigneeId", assigneeFilter);
    if (searchTerm) params.set("search", searchTerm);

    params.set("orderBy", sortBy);
    params.set("orderDirection", sortDirection);
    params.set("page", currentPage.toString());

    router.push(`?${params.toString()}`);
  }, [
    statusFilter,
    severityFilter,
    priorityFilter,
    departmentFilter,
    assigneeFilter,
    searchTerm,
    sortBy,
    sortDirection,
    currentPage,
    router,
  ]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("desc"); // Default sort direction
    }
  };

  // Bulk actions state
  const [selectedIncidents, setSelectedIncidents] = useState<string[]>([]);

  const handleSelectIncident = (id: string) => {
    setSelectedIncidents((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllIncidents = () => {
    if (selectedIncidents.length === incidents.length && incidents.length > 0) {
      setSelectedIncidents([]);
    } else {
      setSelectedIncidents(incidents.map((incident) => incident.id));
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4">
        <Input
          placeholder="Search incidents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-auto"
        />
        <Select
          value={statusFilter}
          onValueChange={(value: IncidentStatus | "all") =>
            setStatusFilter(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.values(IncidentStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={severityFilter}
          onValueChange={(value: IncidentSeverity | "all") =>
            setSeverityFilter(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            {Object.values(IncidentSeverity).map((severity) => (
              <SelectItem key={severity} value={severity}>
                {severity}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={priorityFilter}
          onValueChange={(value: IncidentPriority | "all") =>
            setPriorityFilter(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {Object.values(IncidentPriority).map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={departmentFilter}
          onValueChange={(value: string | "all") => setDepartmentFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={assigneeFilter}
          onValueChange={(value: string | "all") => setAssigneeFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.username || user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions (placeholder) */}
      {selectedIncidents.length > 0 && (
        <div className="mb-4">
          <Button>Bulk Assign ({selectedIncidents.length})</Button>
          <Button className="ml-2">Bulk Change Status</Button>
        </div>
      )}

      {loadingIncidents ? (
        <div>Loading incidents...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <input
                  type="checkbox"
                  checked={
                    selectedIncidents.length === incidents.length &&
                    incidents.length > 0
                  }
                  onChange={handleSelectAllIncidents}
                />
              </TableHead>
              <TableHead
                onClick={() => handleSort("title")}
                className="cursor-pointer"
              >
                Title{" "}
                {sortBy === "title" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="inline h-4 w-4" />
                  ) : (
                    <ChevronDown className="inline h-4 w-4" />
                  ))}
              </TableHead>
              <TableHead
                onClick={() => handleSort("status")}
                className="cursor-pointer"
              >
                Status{" "}
                {sortBy === "status" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="inline h-4 w-4" />
                  ) : (
                    <ChevronDown className="inline h-4 w-4" />
                  ))}
              </TableHead>
              <TableHead
                onClick={() => handleSort("severity")}
                className="cursor-pointer"
              >
                Severity{" "}
                {sortBy === "severity" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="inline h-4 w-4" />
                  ) : (
                    <ChevronDown className="inline h-4 w-4" />
                  ))}
              </TableHead>
              <TableHead
                onClick={() => handleSort("priority")}
                className="cursor-pointer"
              >
                Priority{" "}
                {sortBy === "priority" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="inline h-4 w-4" />
                  ) : (
                    <ChevronDown className="inline h-4 w-4" />
                  ))}
              </TableHead>
              <TableHead
                onClick={() => handleSort("department.name")}
                className="cursor-pointer"
              >
                Department{" "}
                {sortBy === "department.name" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="inline h-4 w-4" />
                  ) : (
                    <ChevronDown className="inline h-4 w-4" />
                  ))}
              </TableHead>
              <TableHead
                onClick={() => handleSort("assignee.username")}
                className="cursor-pointer"
              >
                Assignee{" "}
                {sortBy === "assignee.username" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="inline h-4 w-4" />
                  ) : (
                    <ChevronDown className="inline h-4 w-4" />
                  ))}
              </TableHead>
              <TableHead
                onClick={() => handleSort("createdAt")}
                className="cursor-pointer"
              >
                Reported On{" "}
                {sortBy === "createdAt" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="inline h-4 w-4" />
                  ) : (
                    <ChevronDown className="inline h-4 w-4" />
                  ))}
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.map((incident) => (
              <TableRow key={incident.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedIncidents.includes(incident.id)}
                    onChange={() => handleSelectIncident(incident.id)}
                  />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/incidents/${incident.id}`}
                    className="hover:underline"
                  >
                    {incident.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariantForStatus(incident.status)}>
                    {incident.status}
                  </Badge>
                </TableCell>
                <TableCell>{incident.severity}</TableCell>
                <TableCell>{incident.priority}</TableCell>
                <TableCell>{incident.department.name}</TableCell>
                <TableCell>
                  {incident.assignee?.username || "Unassigned"}
                </TableCell>
                <TableCell>
                  {new Date(incident.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/incidents/${incident.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      <div className="flex justify-end space-x-2 mt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
