import React from "react";
import { TbTrendingDown3, TbTrendingUp3 } from "react-icons/tb";

type StatsCardProps = {
    title: string;
    value: number | string;
    lastMonthValue: number | string;
    percentageChange: number; // positive or negative
    gradient?: string; // 👈 tailwind classes for bg
};

const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    lastMonthValue,
    percentageChange,
    gradient = "bg-gradient-to-r from-violet-500 to-violet-400", // default
}) => {
    const isPositive = percentageChange >= 0;

    return (
        <div
            className={`${gradient} rounded-2xl shadow-default p-6 flex flex-col justify-between text-table-header-text`}
        >
            {/* Header */}
            <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <span
                    className={`flex items-center text-sm font-medium px-3 py-1 rounded-xl ${isPositive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                >
                    {percentageChange}%
                    {isPositive ? (
                        <TbTrendingUp3 className="w-4 h-4 ml-1" />
                    ) : (
                        <TbTrendingDown3 className="w-4 h-4 ml-1" />
                    )}
                </span>
            </div>

            {/* Value */}
            <p className="text-4xl font-bold text-white mt-4">{value}</p>

            {/* Comparison */}
            <p className="text-white text-sm mt-2">
                vs mes anterior: <span className="font-bold">{lastMonthValue}</span>
            </p>
        </div>
    );
};

export default StatsCard;
