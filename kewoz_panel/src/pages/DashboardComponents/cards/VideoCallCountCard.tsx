import StatsCard from "@/components/ui/StatCard";
import { cn } from "@/lib/utils";
import { callService } from "@/services/global/callService";
import { useQuery } from "@tanstack/react-query";

interface UserCountCardProps {
    className?: string;
}

export default function VideoCountCard({ className }: UserCountCardProps) {
    const { data: callStats, isLoading, isError } = useQuery({
        queryKey: ['callStats'],
        queryFn: () => callService.getCallCard(),
    });

    // Calculate percentage change
    const calculatePercentageChange = (current: number, previous: number) => {
        if (previous === 0) return 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    // Get the total users and users from start to one month ago
    const totalVideoCall = callStats?.data.video.totalCalls || 0;
    const videoCallsFromStartToOneMonthAgo = callStats?.data.video.callsFromStartToOneMonthAgo || 0;
    
    // Calculate the number of users added in the last month
    const callThisMonth = totalVideoCall - videoCallsFromStartToOneMonthAgo;
    
    // Calculate percentage change compared to previous period
    const percentageChange = calculatePercentageChange(callThisMonth, videoCallsFromStartToOneMonthAgo);

    if (isLoading || isError) {
        return (
            <div className={cn("space-y-4", className)}>
                <StatsCard
                    title="Llamadas de Video"
                    value={0}
                    lastMonthValue={0}
                    percentageChange={0}
                    gradient="bg-gradient-to-r from-fuchsia-500 to-fuchsia-400"

                />
                
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            <StatsCard
                title="Llamadas de Video"
                value={totalVideoCall}
                lastMonthValue={videoCallsFromStartToOneMonthAgo}
                percentageChange={percentageChange}
                gradient="bg-gradient-to-r from-fuchsia-500 to-fuchsia-400"

            />
            
        </div>
    );
}
