import React, { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    Pie,
    PieChart,
    Cell,
} from "recharts";
import { userService } from "@/services/global/userService";
import { toast } from "sonner";

const PlatformActivity: React.FC = () => {
    // Colors for platforms
    const COLORS = ["#29CCB1", "#34B3F1", "#FFAA00"];
    
    const [platformData, setPlatformData] = useState<{platform: string; count: number}[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlatformData = async () => {
            try {
                const response = await userService.getPlatformUserCounts();
                if (response.status && response.data) {
                    const { android, web,ios } = response.data;
                    const data = [
                        { platform: 'android', count: android.totalUsers },
                        { platform: 'web', count: web.totalUsers },
                        { platform: 'ios', count: ios.totalUsers },

                    ].filter(platform => platform.count > 0); // Only show platforms with users
                    setPlatformData(data);
                }
            } catch (error) {
                console.error('Error fetching platform data:', error);
                toast.error('Failed to load platform activity data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlatformData();
    }, []);

    const total = platformData.reduce((sum, p) => sum + p.count, 0);

    const data = total > 0
        ? platformData.map((p) => ({
            name: `${p.platform.charAt(0).toUpperCase() + p.platform.slice(1)}`,
            value: p.count,
            percent: Number(((p.count / total) * 100).toFixed(0)),
        }))
        : [];

    return (
        <div className="bg-secondary shadow-default p-4 w-full    h-full rounded-lg">
            <h2 className="text-lg font-semibold text-table-header-text">
                Actividad por Plataforma
            </h2>

            {/* Half Circle Pie */}
            <div className="relative flex">
                <ResponsiveContainer height={240} width="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="90%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={80}
                            outerRadius={100}
                            dataKey="value"
                            paddingAngle={2}
                            label={({ percent }) => `${percent}%`}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                {/* Center text */}
                <div className="absolute text-center transform -translate-x-1/2 bottom-7 left-1/2">
                    <h2 className="text-text-muted text-xl font-semibold ">
                        {isLoading ? '...' : '100%'}
                    </h2>
                    <p className="text-text-muted xt-sm font-medium ">
                            Completado
                    </p>
                </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-2">
                {isLoading ? (
                    <div className="text-text-muted">Cargando datos de plataformas...</div>
                ) : data.length > 0 ? (data.map((entry, index) => (
                    <div key={index} className="flex items-start gap-2">
                        <div
                            className="w-4 h-4 rounded-sm mt-1"
                            style={{
                                backgroundColor: COLORS[index % COLORS.length],
                            }}
                        />
                        <div className="flex flex-col items-start">
                            <span className="font-poppins text-text-muted  text-sm">
                                {entry.name}
                            </span>
                            <span className="text-text-muted  text-sm">
                                {entry.percent}%
                            </span>
                        </div>
                    </div>
                ))) : (
                    <div className="text-text-muted">Sin datos de plataformas</div>
                )}
            </div>
        </div>
    );
};

export default PlatformActivity;
