import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { groupService } from "@/services/global/groupService";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, Fragment } from "react";
import ReactApexChart from "react-apexcharts";
import { Listbox, Transition } from "@headlessui/react";
import { Check, ChevronsUpDown } from "lucide-react";
import "./Yearly.css"

interface UserCountCardProps {
    className?: string;
}

export default function YearlyUserData({ className }: UserCountCardProps) {
    const [year, setYear] = useState(new Date().getFullYear());
    const startYear = 2020;

    const { data: yearlyData, isLoading, isError } = useQuery({
        queryKey: ["yearlyUserGroups", year],
        queryFn: () => groupService.getYearlyUserAndGroups({ year }),
    });

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
    }, [startYear]);

    const chartData = useMemo(() => {
        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const newUsers = Array(12).fill(0);
        const newGroups = Array(12).fill(0);

        yearlyData?.data?.newUsersCount?.forEach(item => {
            const monthIndex = parseInt(item.month, 10) - 1;
            if (monthIndex >= 0 && monthIndex < 12) newUsers[monthIndex] = parseInt(item.count, 10) || 0;
        });

        yearlyData?.data?.newGroupsCount?.forEach(item => {
            const monthIndex = parseInt(item.month, 10) - 1;
            if (monthIndex >= 0 && monthIndex < 12) newGroups[monthIndex] = parseInt(item.count, 10) || 0;
        });

        return { months, newUsers, newGroups };
    }, [yearlyData]);

    const getCssVarColor = (className: string) => {
        if (typeof document === "undefined") return "";
        const el = document.createElement("div");
        el.className = className;
        document.body.appendChild(el);
        const color = getComputedStyle(el).color;
        document.body.removeChild(el);
        return color;
    };

    const textMuted = getCssVarColor("text-text-muted");

    const options: ApexCharts.ApexOptions = {
        chart: { type: "bar", stacked: true, toolbar: { show: false } },
        plotOptions: { bar: { horizontal: false, columnWidth: "30%" } },
        xaxis: { categories: chartData.months, labels: { style: { colors: textMuted } } },
        yaxis: { labels: { style: { colors: textMuted } } },
        tooltip: { theme: "dark", style: { fontSize: "12px", fontFamily: "inherit" } },
        legend: { position: "bottom", labels: { colors: textMuted } },
        fill: { opacity: 1 },
        colors: ["#fbc02d", "#5E35B1"],
        states: { normal: { filter: { type: "none" } }, hover: { filter: { type: "none" } }, active: { filter: { type: "none" } } },
    };

    const series = [
        { name: "Nuevos Usuarios", data: chartData.newUsers },
        { name: "Nuevos Grupos", data: chartData.newGroups },
    ];

    if (isError) return <div>Error loading data</div>;
    if (isLoading)
        return (
            <div className="bg-secondary rounded-lg p-6 shadow-sm flex items-center justify-center" style={{ minHeight: "400px" }}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );

    return (
        <Card className="w-full h-[450px] shadow-default rounded-2xl !border-none">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-table-header-text flex gap-3 items-center justify-center">
                    <div className="font-semibold text-black   dark:text-white">Datos Anuales</div>

                    {/* Headless UI Listbox */}
                    <Listbox value={year} onChange={setYear}>
                        <div className="relative">
                            <Listbox.Button className="relative w-24 cursor-pointer  dark:text-white  font-normal  text-black rounded-md bg-transparent border border-gray-300 py-2 pl-3 pr-10 text-left text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                                <span className="block  ">{year}</span> 
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                    <ChevronsUpDown className="h-4 w-4 " />
                                </span>
                            </Listbox.Button>

                            <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md dark:text-red-700  text-black  bg-transparent   py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
                                    {years.map((y) => (
                                        <Listbox.Option
                                            key={y}
                                            value={y}
                                            className={({ active }) =>
                                                `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                                                    active ? " bg-table-row-hover  text-primary" : "      text-black dark:text-white  "
                                                }`
                                            }
                                        >
                                            {({ selected, active }) => (
                                                <>
                                                    <span className={`block ${selected ? "font-semibold" : "font-normal"}`}>{y}</span>
                                                    {selected ? (
                                                        <span
                                                            className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                                                active ? "text-white" : "text-primary"
                                                            }`}
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </span>
                                                    ) : null}
                                                </>
                                            )}
                                        </Listbox.Option>
                                    ))}
                                </Listbox.Options>
                            </Transition>
                        </div>
                    </Listbox>
                </CardTitle>
            </CardHeader>

            <CardContent className="h-[350px]  " >
                <ReactApexChart options={options} series={series} type="bar" height="100%" width="100%" />
            </CardContent>
        </Card>
    );
}
