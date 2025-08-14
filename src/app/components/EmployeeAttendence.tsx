"use client"

import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import axios from "axios";
import api from "../api/axios";

ChartJS.register(ArcElement, Tooltip, Legend);

type AttendanceStatus = {
    present: number;
    absent: number;
    late: number;
    halfday: number;
};

interface Props {
    employeeId: string;
}

const EmployeeAttendance = ({ employeeId }: Props) => {
    const [attendance, setAttendance] = useState<AttendanceStatus>({
        present: 0,
        absent: 0,
        late: 0,
        halfday: 0,
    });

    const monthName = new Date().toLocaleString('default', { month: 'long' });

    useEffect(() => {
        const fetchAttendance = async () => {
        try {
            const res = await api.get<AttendanceStatus>(
            `/user/${employeeId}/monthly`
            );
            setAttendance(res.data);
        } catch (err) {
            console.error("Failed to fetch attendance:", err);
        }
        };

        fetchAttendance();
    }, [employeeId]);

    const productive = attendance.present + attendance.late; 
    const unproductive = attendance.absent + attendance.halfday;

    const data = {
        labels: ["Present", "Absent", "Late", "Half Day"],
        datasets: [
        {
            data: [attendance.present, attendance.absent, attendance.late, attendance.halfday],
            backgroundColor: ["#4CAF50", "#F44336", "#FF9800", "#FFC107"],
            borderWidth: 0,
            cutout: "70%",
        },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
        },
    };

    return (
        <div
        style={{ position: "relative" }}
        className="w-[250px] h-[250px] lg:w-[320px] lg:h-[320px]"
        >
        <Doughnut data={data} options={options} />
        <div
            style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#ccc",
            fontSize: "14px",
            fontWeight: "bold",
            letterSpacing: "2px",
            }}
        >
            {monthName}
        </div>
        </div>
    );
};

export default EmployeeAttendance;
