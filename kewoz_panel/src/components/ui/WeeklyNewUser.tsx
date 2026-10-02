"use client";
import { PiUserCircleThin } from "react-icons/pi";

import React, { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/";
import { userService } from "@/services/global/userService";
import { CircleUserRound } from "lucide-react";
import UserList1 from "/Images/userlisrrr.png";

// Define the NewUser interface to match the API response
interface NewUser {
    day: string;
    count: number;
}

interface WeeklyUserData {
    day: string;
    users: number;
}

// Default data in case API fails
const defaultData: WeeklyUserData[] = [
    { day: "Dom", users: 0 },
    { day: "Lun", users: 0 },
    { day: "Mar", users: 0 },
    { day: "Mié", users: 0 },
    { day: "Jue", users: 0 },
    { day: "Vie", users: 0 },
    { day: "Sáb", users: 0 },
];

const CustomTooltip = ({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: any;
    label?: string;
}) => {
    if (active && payload && payload.length) {
        return (
            <div className="relative bg-secondary shadow-lg rounded-xl p-4 border border-table-divider">
                {/* Arrow */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 
                    border-l-8 border-r-8 border-b-8 border-transparent border-b-table-divider" />

                {/* Day */}
                <p className="text-text-muted font-bold text-base mb-2">{label}</p>

                {/* Divider line */}
                <div className="border-t border-table-header-bg my-2"></div>

                {/* New User row */}
                <div className="flex items-center space-x-2">
                    {/* Yellow hexagon icon */}
                    <div className="w-3 h-3 bg-yellow-400 clip-hexagon"></div>
                    <p className="text-text-muted text-sm">
                        Usuarios Nuevos <span className="font-bold text-text-muted ml-1">{payload[0].value}</span>
                    </p>
                </div>
            </div>

        );
    }
    return null;
};


// Custom bar with gray background + yellow progress
const WeeklyNewUsers: React.FC = () => {
    const [data, setData] = useState<WeeklyUserData[]>(defaultData);
    const [maxUsers, setMaxUsers] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const CustomBar = (props: any) => {
        const { x, y, height, value, background } = props;

        // full bar width comes from background.width (always spans full axis)
        const fullWidth = background?.width || 0;

        return (
            <g>
                {/* Always full gray background (rounded) */}
                <rect
                    x={x}
                    y={y}
                    width={fullWidth}
                    height={height}
                    fill="#f3f4f6"
                    rx="10"
                    ry="10"
                />
                {/* Yellow progress (rectangle only) */}
                {value > 0 && (
                    <rect
                        x={x}
                        y={y}
                        width={(fullWidth * value) / maxUsers}
                        height={height}
                        fill="#FACC15"
                    />
                )}
            </g>
        );
    };



    useEffect(() => {
        const fetchWeeklyUsers = async () => {
            try {
                setIsLoading(true);
                const response = await userService.getWeeklyUsers();

                // Transform the API response to match our WeeklyUserData[] structure
                const weeklyData = response.data.newUsers.map((item: NewUser) => ({
                    day: item.day,
                    users: Number(item.count) // Ensure it's a number
                }));

                setData(weeklyData);
                setMaxUsers(Math.max(...weeklyData.map(d => d.users), 1)); // Ensure max is at least 1
            } catch (err) {
                console.error('Failed to fetch weekly users:', err);
                setError('Failed to load weekly user data');
                setData(defaultData);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWeeklyUsers();
    }, []);

    if (isLoading) {
        return (
            <Card className="rounded-lg   max-w-full mx-auto  !border-none bg-secondary shadow-default h-full">
                <CardHeader>
                    <CardTitle className="ttext-lg font-semibold text-table-header-text">
                        Usuarios Nuevos Semanales
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Cargando...</div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="rounded-2xl shadow-md border border-gray-200 h-full">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-table-header-text">
                        <div>

                            Usuarios Nuevos Semanales
                        </div>
                        <div className="rounded-full bg-primary-dark">
                            <CircleUserRound size={12} />
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64">
                    <div className="text-red-500">{error}</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-lg   max-w-full mx-auto shadow-default border-none bg-secondary  h-full">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-table-header-text flex justify-between items-center">
                    <div>

                        Usuarios Nuevos Semanales
                    </div>
                    <div className="w-5 h-5">
                        <img src={UserList1} alt=""  />
                        {/* <PiUserCircleThin size={25}  /> */}
                    </div>                </CardTitle>
            </CardHeader>
            <CardContent className="h-full">
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 30, right: 30, left: 10, bottom: 30 }}
                        barCategoryGap="60%"
                    >
                        <XAxis
                            type="number"
                            hide
                            domain={[0, maxUsers]}
                        />
                        <YAxis
                            type="category"
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "var(--color-text-muted)", fontSize: 14 }}
                            width={40}
                        />


                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />

                        <Bar
                            dataKey="users"
                            barSize={20}
                            shape={<CustomBar />}
                            isAnimationActive={false}
                            background // <-- this ensures background prop is passed
                        />

                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default WeeklyNewUsers;
