import StatsCard from "@/components/ui/StatCard";
import { cn } from "@/lib/utils";
import { groupService } from "@/services/global/groupService";
import { useQuery } from "@tanstack/react-query";

interface UserCountCardProps {
    className?: string;
}

export default function GroupCountCard({ className }: UserCountCardProps) {
    const { data: groupStats, isLoading, isError } = useQuery({
        queryKey: ['groupStats'],
        queryFn: () => groupService.getGroupCard(),
    });

    // Calculate percentage change
    const calculatePercentageChange = (current: number, previous: number) => {
        if (previous === 0) return 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    // Get the total users and users from start to one month ago
    const totalGroupChats = groupStats?.data?.totalGroupChats || 0;
    const groupChatsFromStartToOneMonthAgo = groupStats?.data?.groupChatsFromStartToOneMonthAgo || 0;
    
    // Calculate the number of users added in the last month
    const groupsThisMonth = totalGroupChats - groupChatsFromStartToOneMonthAgo;
    
    // Calculate percentage change compared to previous period
    const percentageChange = calculatePercentageChange(groupsThisMonth, groupChatsFromStartToOneMonthAgo);

    if (isLoading || isError) {
        return (
            <div className={cn("space-y-4", className)}>
                <StatsCard
                    title="Grupos Totales"
                    value={0}
                    lastMonthValue={0}
                    percentageChange={0}
                    gradient="bg-gradient-to-r from-violet-500 to-violet-400"

                />
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            <StatsCard
                title="Grupos Totales"
                value={totalGroupChats}
                lastMonthValue={groupChatsFromStartToOneMonthAgo}
                percentageChange={percentageChange}
                gradient="bg-gradient-to-r from-violet-500 to-violet-400"

            />
        </div>
    );
}
