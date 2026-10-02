import { Bell } from "lucide-react";
import { Button } from "../ui/Button";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/store/useNotificationStore";

export function NotificationButton() {
    const {
        isAvailable,
        setAvailable,
        fetchNotifications,
        notifications,
        pagination,
        loadingMore,
    } = useNotificationStore();
    function timeAgo(dateString: string) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return `${seconds} sec ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} min ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
        const months = Math.floor(days / 30);
        if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
        const years = Math.floor(months / 12);
        return `${years} year${years > 1 ? "s" : ""} ago`;
    }
    const [open, setOpen] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    // Handle clicks outside the dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        // Add event listener when dropdown is open
        if (open) {
            fetchNotifications(1, 5); // Only fetch 5 notifications initially
            setAvailable(false); // clear green dot
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Clean up the event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open, fetchNotifications, setAvailable]);

    return (
        <div className="relative inline-block">
            <Button
                size="icon"
                // variant=""
                onClick={() => setOpen((prev) => !prev)}
                className="relative h-10 w-10  border rounded-full    l text-text "
            >
                <Bell className="h-5 w-5" />
                {isAvailable && (
                    <span className="flex absolute w-3 h-3 ltr:right-0 rtl:left-0 top-0">
                        <span className="animate-ping-custom absolute -right-[2px] -top-[3px] inline-flex h-3 w-3 rounded-full bg-green-500/75"></span>
                        <span className="absolute -right-[2px]  -top-[1px] inline-flex rounded-full w-2 h-2 bg-green-500"></span>
                    </span>
                )}
            </Button>

            {open && (
                <div
                    ref={dropdownRef}
                    className="notification-dropdown w-auto rounded-sm  border border-table-divider bg-secondary shadow-lg overflow-hidden"
                >
                    {notifications?.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500">No notifications</div>
                    ) : (
                        <>

                            <div className="w-full  flex  justify-between py-3 text-sm font-medium text-center  border-b border-b-table-divider">
                                <div className=" px-3 font-semibold text-table-header-text">

                                    Notification
                                </div>
                                <div className=" bg-primary-light mr-3 rounded-md">

                                    <span className="px-2 py-1 text-[12px] text-black">{pagination?.total_records} New</span>
                                </div>


                            </div>
                            <div className="divide-y divide-table-divider">
                                <ul>
                                    {notifications.map((user) => (
                                        <li key={user.user_id} className="p-3 text-sm bg-table-row hover:bg-table-row-hover border-b border-b-table-divider">
                                            <div className="flex items-center">
                                                <img
                                                    src={user?.profile_pic || "/default-avatar.png"}
                                                    alt={user.first_name}
                                                    className="h-12 w-12 rounded-full mr-2 object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                                                    }}
                                                />
                                                <div>
                                                    <div>
                                                        <span className="font-semibold text-table-header-text pr-2">
                                                            {user.first_name} {user.last_name || ''}
                                                        </span>
                                                        <span className="text-table-header-text">
                                                            is added as
                                                        </span>
                                                        <span className="pl-2 font-semibold text-table-header-text">
                                                            New User
                                                        </span>
                                                    </div>

                                                    <p className="text-xs text-gray-500">{timeAgo(user.createdAt)}</p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                {(
                                    <div className="w-full flex justify-center py-2 px-3">

                                        <button
                                            onClick={() => {
                                                setOpen(false);
                                                navigate('/users/user-list');
                                            }}
                                            className="w-full  bg-gradient-to-r from-primary to-primary/60 text-black font-medium py-1 rounded-md transition-colors duration-200"
                                        >
                                            View All Users
                                        </button>
                                    </div>

                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}