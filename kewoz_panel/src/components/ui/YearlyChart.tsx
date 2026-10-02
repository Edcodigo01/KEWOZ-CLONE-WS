"use client";

import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { GoTriangleDown } from "react-icons/go";

interface DataPoint {
    month: string | number;
    newUsers?: number;
    newGroups?: number;
}

interface YearlyChartProps {
    data: DataPoint[];
    year: number;
    startYear?: number;
    onYearChange?: (year: number) => void;
}

export default function YearlyChart({
    data,
    year,
    startYear = 2020,
    onYearChange,
}: YearlyChartProps) {
    // Month names
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    // Convert numeric months → names
    const categories = data.map((d) => monthNames[Number(d.month) - 1]);

    // Generate years dynamically
    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
    }, [startYear]);

    // ✅ Extract CSS variable from Tailwind class
    const getCssVarColor = (className: string) => {
        const el = document.createElement("div");
        el.className = className;
        document.body.appendChild(el);
        const color = getComputedStyle(el).color;
        document.body.removeChild(el);
        return color;
    };

    const textMuted = getCssVarColor("text-text-muted");

    // Chart options
    const chartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: "line",
            toolbar: { show: false },
            zoom: { enabled: false },
        },
        stroke: {
            curve: "smooth",
            width: 3,
        },
        xaxis: {
            categories,
            labels: { style: { colors: textMuted } },
        },
        yaxis: {
            labels: { style: { colors: textMuted } },
        },
        tooltip: {
            theme: "dark", // will adapt to dark mode
            style: {
                fontSize: "12px",
                fontFamily: "inherit",
            },
        },
        legend: {
            position: "bottom",
            horizontalAlign: "center",
            labels: { colors: textMuted },
        },
        colors: ["#0066FF", "#54C300"],
    };

    const chartSeries = [
        {
            name: "Nuevos Usuarios",
            data: data.map((d) => Number(d.newUsers ?? 0)),
        },
        {
            name: "Nuevos Grupos",
            data: data.map((d) => Number(d.newGroups ?? 0)),
        },
    ];

    return (
        <Card className="w-full h-[450px] shadow-default rounded-2xl !border-none ">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-table-header-text  flex gap-3 items-center justify-center">
                    <div>Datos Anuales</div>

                    {/* Year dropdown */}
                    <div className="relative">
                        <select
                            value={year}
                            onChange={(e) => onYearChange?.(Number(e.target.value))}
                            className="appearance-none !border-none bg-transparent text-primary-dark rounded-md px-1 py-1 text-sm pr-6 cursor-pointer hover:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            {years.map((y) => (
                                <option key={y} value={y} className="bg-secondary text-table-header-text !focus:bg-table-row-hover">
                                    {y}
                                </option>
                            ))}
                        </select>
                        <GoTriangleDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-dark pointer-events-none" />
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="h-[350px]">
                <ReactApexChart
                    options={chartOptions}
                    series={chartSeries}
                    type="line"
                    height="100%"
                    width="100%"
                />
            </CardContent>
        </Card>
    );
}
