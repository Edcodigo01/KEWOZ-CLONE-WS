import StatsCard from "@/components/ui/StatCard";
import { cn } from "@/lib/utils";
import { callService } from "@/services/global/callService";
import { useQuery } from "@tanstack/react-query";

interface UserCountCardProps {
    className?: string;
}

export default function AudioCountCard({ className }: UserCountCardProps) {
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
    const totalAudioCall = callStats?.data.audio.totalCalls || 0;
    const audioCallsFromStartToOneMonthAgo = callStats?.data.audio.callsFromStartToOneMonthAgo || 0;
    
    // Calculate the number of users added in the last month
    const groupsThisMonth = totalAudioCall - audioCallsFromStartToOneMonthAgo;
    
    // Calculate percentage change compared to previous period
    const percentageChange = calculatePercentageChange(groupsThisMonth, audioCallsFromStartToOneMonthAgo);

    if (isLoading || isError) {
        return (
            <div className={cn("space-y-4", className)}>
                <StatsCard
                    title="Llamadas de Audio"
                    value={0}
                    lastMonthValue={0}
                    percentageChange={0}
                    gradient="bg-gradient-to-r from-blue-500 to-blue-400"

                />
                
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            <StatsCard
                title="Llamadas de Audio"
                value={totalAudioCall}
                lastMonthValue={audioCallsFromStartToOneMonthAgo}
                percentageChange={percentageChange}
                gradient="bg-gradient-to-r from-blue-500 to-blue-400"

            />
            
        </div>
    );
}
