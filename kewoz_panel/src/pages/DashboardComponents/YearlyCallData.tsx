import React, { useState, useMemo, useEffect, Fragment } from "react";
import ReactApexChart from "react-apexcharts";
import { callService } from "@/services/global/callService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Listbox, Transition } from "@headlessui/react";
import { Check, ChevronsUpDown } from "lucide-react";

const YearlyCallData: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 2020;
    const [year, setYear] = useState(currentYear.toString());
    const [isLoading, setIsLoading] = useState(true);

    // Generate year options
    const years = useMemo(() => {
        return Array.from(
            { length: currentYear - startYear + 1 },
            (_, i) => (startYear + i).toString()
        ).reverse(); // Optional: reverse to show latest first
    }, [startYear, currentYear]);

    const [videoCallsCount, setVideoCallsCount] = useState<
        { month: string; count: string }[]
    >([]);
    const [audioCallsCount, setAudioCallsCount] = useState<
        { month: string; count: string }[]
    >([]);

    useEffect(() => {
        const fetchYearlyData = async () => {
            try {
                setIsLoading(true);
                const response = await callService.getYearlyCallData({
                    year: parseInt(year),
                });

                setVideoCallsCount(response.data.videoCallsCount || []);
                setAudioCallsCount(response.data.audioCallsCount || []);
            } catch (error) {
                console.error("Error fetching yearly call data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchYearlyData();
    }, [year]);

    const chartData = useMemo(() => {
        const months = [
            "Ene",
            "Feb",
            "Mar",
            "Abr",
            "May",
            "Jun",
            "Jul",
            "Ago",
            "Sep",
            "Oct",
            "Nov",
            "Dic",
        ];

        const video = months.map((_, idx) => {
            const monthNum = (idx + 1).toString();
            return Number(
                videoCallsCount.find((v) => v.month === monthNum)?.count || "0"
            );
        });

        const audio = months.map((_, idx) => {
            const monthNum = (idx + 1).toString();
            return Number(
                audioCallsCount.find((a) => a.month === monthNum)?.count || "0"
            );
        });

        return { months, video, audio };
    }, [videoCallsCount, audioCallsCount]);

    const getCssVarColor = (className: string) => {
        const el = document.createElement("div");
        el.className = className;
        document.body.appendChild(el);
        const color = getComputedStyle(el).color;
        document.body.removeChild(el);
        return color;
    };

    const textMuted = getCssVarColor("text-text-muted");

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
            categories: chartData.months,
            labels: { style: { colors: textMuted } },
        },
        yaxis: {
            labels: { style: { colors: textMuted } },
        },
        tooltip: {
            theme: "dark",
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
            name: "Llamadas de Video",
            data: chartData.video,
        },
        {
            name: "Llamadas de Audio",
            data: chartData.audio,
        },
    ];

    if (isLoading) {
        return (
            <div
                className="bg-secondary rounded-lg p-6 shadow-sm flex items-center justify-center"
                style={{ minHeight: "400px" }}
            >
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <Card className="w-full h-[450px] shadow-default rounded-2xl !border-none">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-table-header-text flex gap-3 items-center">
                    <div>Datos Anuales</div>
                    <div className="relative">
                        <Listbox value={year} onChange={setYear}>
                            <div className="relative">
                                <Listbox.Button
                                    className="relative w-24 flex items-center justify-between cursor-pointer 
             border border-gray-300 rounded-md bg-white  dark:bg-[#1A1A1A] px-3 py-1.5 
             text-sm text-primary-dark shadow-sm 
             focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <span className="truncate  text-black font-normal  dark:text-white">{year}</span>
                                    <ChevronsUpDown className="h-5 w-5  text-black dark:text-white" />
                                </Listbox.Button>


                                <Transition
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md  bg-transparent py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
                                        {years.map((y) => (
                                            <Listbox.Option
                                                key={y}
                                                value={y}
                                                className={({ active }) =>
                                                    `relative cursor-pointer select-none py-2 pl-3 pr-9 ${active ? " bg-table-row-hover text-primary" : "   text-black   dark:text-white"
                                                    }`
                                                }
                                            >
                                                {({ selected, active }) => (
                                                    <>
                                                        <span className={`block ${selected ? "font-semibold" : "font-normal"}`}>{y}</span>
                                                        {selected ? (
                                                            <span
                                                                className={`absolute inset-y-0 right-0 flex items-center pr-4 ${active ? "text-white" : "text-primary"
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
};

export default YearlyCallData;
