'use client'

import { useState } from "react";


type Employee = {
    _id: string;
    name?: string;
    employeeCode?: string;
    role?: string;
};

type SearchableDropdownProps = {
    employees: Employee[];
    selectedEmployee: string;
    setSelectedEmployee: (id: string) => void;
};



export default function SearchableDropdown({ employees, selectedEmployee, setSelectedEmployee }: SearchableDropdownProps) {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);

    const filteredEmployees = employees
    .filter((emp) => emp.role?.toLowerCase() !== "admin")
    .filter(emp =>
        (emp.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (emp.employeeCode ?? "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex-1 min-w-0 relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Employee
        </label>

        <div
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer"
            onClick={() => setOpen(!open)}
        >
            {selectedEmployee
            ? employees.find(e => e._id === selectedEmployee)?.name +
                " (" +
                employees.find(e => e._id === selectedEmployee)?.employeeCode +
                ")"
            : "All Employees"}
        </div>

        {open && (
            <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 border-b border-gray-200 focus:outline-none"
            />

            <div className="max-h-48 overflow-y-auto">
                <div
                onClick={() => {
                    setSelectedEmployee("");
                    setOpen(false);
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                All Employees
                </div>
                {filteredEmployees.length > 0 ? (
                filteredEmployees.map(emp => (
                    <div
                    key={emp._id}
                    onClick={() => {
                        setSelectedEmployee(emp._id);
                        setOpen(false);
                        setSearch("");
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                    {emp.name} ({emp.employeeCode})
                    </div>
                ))
                ) : (
                <div className="px-4 py-2 text-gray-500">No results found</div>
                )}
            </div>
            </div>
        )}
        </div>
    );
}
