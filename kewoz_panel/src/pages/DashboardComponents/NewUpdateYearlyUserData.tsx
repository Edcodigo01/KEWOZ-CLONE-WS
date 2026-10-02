"use client";

import React, { useEffect, useState, Fragment } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { Listbox, Transition } from "@headlessui/react";
import { Check, ChevronsUpDown } from "lucide-react";

import Calendar from "/Images/bar_calendar.png";
import Loader from "/Images/Loader.gif";

import useApiPost from "@/services/global/PostData";
import { useTheme } from "@/hooks/common/useTheme";

interface BarGraphData {
    name: string;
    users: number;
    groups: number;
    remaining: number;
    color: string;
}

const MAX = 100; // Adjust according to your maximum value for YAxis

const monthMap: Record<number, string> = {
    1: "Ene",
    2: "Feb",
    3: "Mar",
    4: "Abr",
    5: "May",
    6: "Jun",
    7: "Jul",
    8: "Ago",
    9: "Sep",
    10: "Oct",
    11: "Nov",
    12: "Dic",
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
        const usersData = payload.find((p: any) => p.dataKey === "users")?.value || 0;
        const groupsData = payload.find((p: any) => p.dataKey === "groups")?.value || 0;

        return (
            <div className="px-3 py-2 bg-white border border-gray-200 rounded shadow-sm">
                <p className="text-sm text-gray-700 font-poppins">{label}</p>
                <p className="text-sm font-semibold text-textcolor font-poppins">
                    Usuarios: {usersData}
                </p>
                <p className="text-sm font-semibold text-textcolor font-poppins">
                    Grupos: {groupsData}
                </p>
            </div>
        );
    }
    return null;
};

const NewUpdateYearlyUserData: React.FC = () => {
    const { postData, loading, error, data } = useApiPost();
    const theme = useTheme().theme;

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const startYear = 2025;
    const yearOptions = Array.from(
        { length: currentYear - startYear + 1 },
        (_, i) => startYear + i
    );

    const [year, setYear] = useState<string>(currentYear.toString());
    const [barData, setBarData] = useState<BarGraphData[]>([]);


    console.log("barDatabarDatabarData", barData)

    useEffect(() => {
        const fetchData = async () => {
            const formData = new FormData();
            formData.append("year", year);

            try {
                const response = await postData("admin/yearly-new-users-and-grps", formData);


                console.log("responseresponseresponse" ,response?.data)

                if (response.data) {
                    const newUsers = response.data.newUsersCount || [];
                    const newGroups = response.data.newGroupsCount || [];

                    console.log("newUsers monnnn" ,newUsers)

                    // Determine dynamic max for Y-axis
                    const allCounts = [
                        ...newUsers.map((u: any) => Number(u.count)),
                        ...newGroups.map((g: any) => Number(g.count)),
                    ];
                    const dynamicMax = Math.max(...allCounts, 10); // at least 10

                    const combinedData: BarGraphData[] = Array.from({ length: 12 }, (_, i) => {
                        const monthNum = i + 1;

                        const userItem = newUsers.find((u: any) => Number(u.month) === monthNum);
                        const groupItem = newGroups.find((g: any) => Number(g.month) === monthNum);

                        const users = userItem ? Number(userItem.count) : 0;
                        const groups = groupItem ? Number(groupItem.count) : 0;

                        const remaining = dynamicMax - (users + groups);

                        return {
                            name: monthMap[monthNum],
                            users,
                            groups,
                            remaining: remaining > 0 ? remaining : 0,
                            color: monthNum === currentMonth ? "#00C49F" : "#59A7FF",
                        };
                    });

                    setBarData(combinedData);
                } else {
                    setBarData([]);
                }
            } catch {
                setBarData([]);
            }
        };

        fetchData();
    }, [year, currentMonth]);


    // Render loading
    if (loading) {
        return (
            <div className="border border-bordercolor rounded-lg p-4 w-full h-[440px] flex items-center justify-center">
                <img src={Loader} className="w-12 h-12" alt="Loading..." />
            </div>
        );
    }

    // Render error
    if (error) {
        return (
            <div className="border border-red-500 rounded-lg p-4 w-full h-[440px] flex items-center justify-center text-red-600">
                Error loading data
            </div>
        );
    }

    // Render no data
    if (!barData || barData.length === 0) {
        return (
            <div className="border border-gray-300 rounded-lg p-4 w-full h-[440px] flex items-center justify-center">
                No data available
            </div>
        );
    }

    return (
        <div className="border border-bordercolor rounded-lg p-4 w-full">
            <div className="overflow-x-auto 2xl:overflow-x-visible">
                <div className="w-full">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-textcolor font-poppins text-base font-semibold">
                            User & Group Growth Summary
                        </h2>

                        {/* Year Selector */}
                        <div className="w-[7rem]">
                            <Listbox value={year} onChange={setYear}>
                                <div className="relative">
                                    <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-bordercolor bg-primary py-2 pl-10 pr-10 text-left text-sm text-textcolor shadow-sm hover:border-gray-400 focus:outline-none focus:ring-1 transition">
                                        <img
                                            src={Calendar}
                                            className="absolute left-2 top-2.5 w-4 h-4"
                                            alt="Calendar"
                                        />
                                        <span>{year}</span>
                                        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                            <ChevronsUpDown
                                                className="h-5 w-5 text-gray-400"
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </Listbox.Button>

                                    <Transition
                                        as={Fragment}
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-hidden rounded-md bg-primary py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
                                            {yearOptions.map((yr) => (
                                                <Listbox.Option
                                                    key={yr}
                                                    className={({ active }) =>
                                                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? "bg-blue-100 text-[#239C57]" : "text-textcolor"
                                                        }`
                                                    }
                                                    value={yr.toString()}
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span
                                                                className={`block truncate ${selected ? "font-medium" : "font-normal"
                                                                    }`}
                                                            >
                                                                {yr}
                                                            </span>
                                                            {selected && (
                                                                <span className="absolute inset-y-0 left-2 flex items-center text-[#239C57]">
                                                                    <Check className="h-5 w-5" aria-hidden="true" />
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                    </Transition>
                                </div>
                            </Listbox>
                        </div>
                    </div>

                    <p className="text-[#737373] font-poppins text-sm pb-6">
                        Revealing risk and growth in investment
                    </p>

                    {/* Bar Chart */}
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={barData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, MAX]} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0)" }} />

                            {/* Users Bar */}
                            <Bar dataKey="users" stackId="a" barSize={20} radius={[4, 4, 0, 0]}>
                                {barData.map((entry, index) => (
                                    <Cell key={`cell-users-${index}`} fill={entry.color} />
                                ))}
                            </Bar>

                            {/* Groups Bar */}
                            <Bar dataKey="groups" stackId="a" barSize={20} radius={[4, 4, 0, 0]}>
                                {barData.map((entry, index) => (
                                    <Cell key={`cell-groups-${index}`} fill="#FFA500" />
                                ))}
                            </Bar>

                            {/* Remaining Bar */}
                            <Bar
                                dataKey="remaining"
                                stackId="a"
                                fill={theme === "dark" ? "#333333" : "#F0F0F0"}
                                barSize={20}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default NewUpdateYearlyUserData;
