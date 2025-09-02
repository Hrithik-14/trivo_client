/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/app/api/axios";
import toast from "react-hot-toast";
import Select, { SingleValue } from "react-select";
import { Ban, Lock, Unlock, UserCheck, UserX } from "lucide-react";

interface Project {
  _id: string;
  name: string;
  startDate: string;
  endDate?: string;
  managerId:
    | string
    | {
        _id: string;
        name: string;
        employeeCode: string;
        profileImage?: string;
      };
  description: string;
  client: string;
  clientEmail: string;
  members?: Member[];
  status?: string;
  tasks?: string[];
  __v?: number;
}

interface Manager {
  _id: string;
  name: string;
  email: string;
  employeeCode: string;
}

interface Member {
  user: TeamMember;
  isActive?: boolean;
}

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  employeeCode: string;
  role?: string;
  department?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    employeeCode: string;
    profileImage?: string;
  };
  isActive?: boolean;
}

interface Employee {
  _id: string;
  name: string;
  email: string;
  employeeCode: string;
  role?: string;
  department?: string;
}

export default function UpdateProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.slug as string;
  const [project, setProject] = useState<Project | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<SingleValue<{ value: string; label: string }>>(null);
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    managerId: "",
    description: "",
    client: "",
    clientEmail: "",
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  // console.log("teamMembersdd",teamMembers)
  // if(teamMembers.user)
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [projectResponse, managersResponse, employeesResponse] =
          await Promise.all([
            api.get(`/getProjectById/${projectId}`),
            api.get("/managersdeatil"),
            api.get("/employees"),
          ]);

        const projectData =
          projectResponse.data.project || projectResponse.data;
        const managersData =
          managersResponse.data.managers || managersResponse.data;
        const employeesData =
          employeesResponse.data.employees || employeesResponse.data;

        console.log("Project data:", projectData);
        console.log("Members:", projectData.members);

        setProject(projectData);
        setManagers(managersData);
        setEmployees(employeesData);
        setTeamMembers(projectData.members || []);
        setFormData({
          name: projectData.name || "",
          startDate: projectData.startDate
            ? projectData.startDate.split("T")[0]
            : "",
          endDate: projectData.endDate ? projectData.endDate.split("T")[0] : "",
          managerId:
            typeof projectData.managerId === "object"
              ? projectData.managerId._id
              : projectData.managerId || "",
          description: projectData.description || "",
          client: projectData.client || "",
          clientEmail: projectData.clientEmail || "",
        });
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(
          err.response?.data?.message || "Failed to fetch project details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId, refreshKey]); // 🔑 refreshKey added here

  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    }
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }
    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate > formData.endDate
    ) {
      newErrors.endDate = "End date must be after start date";
    }
    if (!formData.managerId) {
      newErrors.managerId = "Manager is required";
    }
    if (!formData.client.trim()) {
      newErrors.client = "Client name is required";
    }
    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = "Client email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) {
      newErrors.clientEmail = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleAddTeamMember = () => {
    if (selectedEmployee) {
      const isAlreadyMember = teamMembers.some(
        (member) => member._id === selectedEmployee.value
      );
      if (isAlreadyMember) {
        toast.error("This employee is already a team member");
        return;
      }
      const employeeData = employees.find(
        (emp) => emp._id === selectedEmployee.value
      );
      if (employeeData) {
        setTeamMembers((prev) => [...prev, employeeData]);
        setSelectedEmployee(null);
        setShowAddMember(false);
        toast.success("Team member added successfully");
      }
    }
  };

  const handleToggleTeamMember = (memberId: string) => {
    try {
      const fetchData = async () => {
        const response = await api.patch(
          `/projects/${project?._id}/members/${memberId}`
        );
        setRefreshKey((prev) => prev + 1);
        // API returns updated project -> update only members in state
        setTeamMembers(response.data.members);

        // Show toast based on new state of the toggled member
        const toggled = response.data.members.find(
          (m: any) => m.user === memberId
        );
        toast.success(
          toggled?.isActive
            ? "Team member activated"
            : "Team member deactivated"
        );
      };

      fetchData();
    } catch (err) {
      console.log(err);
      toast.error("Failed to update member status");
    }
  };

  const getAvailableEmployees = () => {
    return employees
      .filter((emp) => !teamMembers.some((member) => member._id === emp._id))
      .map((emp) => ({
        value: emp._id,
        label: `${emp.name} (${emp.employeeCode}) - ${emp.role || "No Role"}`,
      }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      setUpdating(true);
      setError(null);
      const updateData = {
        ...formData,
        members: teamMembers.map((member) => member._id),
      };
      const response = await api.patch(
        `/updateProject/${projectId}`,
        updateData
      );
      if (response.data.status === "success") {
        toast.success("Project updated successfully!");
        router.push(`/admin/Project/${projectId}`);
      }
    } catch (err: any) {
      toast.error("Error updating project");
      setError(err.response?.data?.message || "Failed to update project");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => router.back()}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Update Project</h1>
            <p className="text-gray-600 mt-2">
              Modify project details and manage team members
            </p>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Project Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Project Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Project Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter project name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="managerId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Project Manager *
                  </label>
                  <Select
                    id="managerId"
                    options={managers.map((manager) => ({
                      value: manager._id,
                      label: `${manager.name} (${manager.employeeCode})`,
                    }))}
                    value={managers
                      .filter((manager) => manager._id === formData.managerId)
                      .map((manager) => ({
                        value: manager._id,
                        label: `${manager.name} (${manager.employeeCode})`,
                      }))}
                    onChange={(
                      selectedOption: SingleValue<{
                        value: string;
                        label: string;
                      }>
                    ) => {
                      setFormData((prev) => ({
                        ...prev,
                        managerId: selectedOption?.value || "",
                      }));
                      if (errors.managerId) {
                        setErrors((prev) => ({
                          ...prev,
                          managerId: undefined,
                        }));
                      }
                    }}
                    isSearchable
                    classNamePrefix="react-select"
                    placeholder="Select project manager..."
                  />
                  {errors.managerId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.managerId}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.startDate
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.startDate}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    End Date *
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.endDate
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.endDate}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="client"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Client Name *
                  </label>
                  <input
                    type="text"
                    id="client"
                    name="client"
                    value={formData.client}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.client
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter client name"
                  />
                  {errors.client && (
                    <p className="mt-1 text-sm text-red-600">{errors.client}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="clientEmail"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Client Email *
                  </label>
                  <input
                    type="email"
                    id="clientEmail"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.clientEmail
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter client email"
                  />
                  {errors.clientEmail && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.clientEmail}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Project Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter project description..."
                />
              </div>
            </div>
            {/* Team Members Management */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Team Members
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                >
                  {showAddMember ? "Cancel" : "Add Member"}
                </button>
              </div>
              {/* Add Member Section */}
              {showAddMember && (
                <div className="bg-gray-50 p-4 rounded-md mb-6">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Employee
                      </label>
                      <Select
                        value={selectedEmployee}
                        onChange={setSelectedEmployee}
                        options={getAvailableEmployees()}
                        isSearchable
                        placeholder="Search and select an employee..."
                        classNamePrefix="react-select"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTeamMember}
                      disabled={!selectedEmployee}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
              {/* Current Team Members */}
              <div className="space-y-3">
                {teamMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                    </div>
                    No team members assigned to this project
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamMembers.map((member) => (
                      <div
                        key={member._id}
                        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-blue-600 font-medium text-sm">
                                  {member.user?.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {member.user?.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {member.user?.employeeCode}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600">
                                {member.email}
                              </p>
                              {member.role && (
                                <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  {member.role}
                                </span>
                              )}
                              {member.department && (
                                <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full ml-1">
                                  {member.department}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleTeamMember(member._id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                            title="Remove team member"
                          >
                            {/* <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg> */}

                            {member.isActive === false ? (
                              <div className="flex gap-4 text-xl">
                                <UserX aria-label="User Blocked" />{" "}
                              </div>
                            ) : (
                              <div>
                                {" "}
                                {/* <Unlock aria-label="Unblock" /> */}
                                <UserCheck aria-label="User Unblocked" />
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={updating}
                className={`flex-1 sm:flex-none px-6 py-3 text-white font-medium rounded-md transition-colors ${
                  updating
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                }`}
              >
                {updating ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  "Update Project"
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
