import {
  DataTable,
  type DataTableColumn,
  Input,
  Button,
  Toggle,
} from "@/components/ui";
import { useEffect, useState } from "react";
import { callService } from "@/services/global/callService";
import { Breadcrumb } from "@/layouts";
import { Search } from "lucide-react";
type Platform = "App" | "Web";
type Status = "Online" | "Offline";

type UserRow = {
  id: number;
  profile_pic: string;
  fullName: string;
  emailMasked: string;
  username: string;
  countryCode: string; // ISO alpha-2
  country: string;
  joinedAt: string; // ISO date
  platform: Platform;
  reportCounts: number;
  status: Status;
  is_blocked: boolean;
};

function countryFlag(code: string) {
  // Use emoji flags for portability
  const cc = code.toUpperCase();
  return cc.replace(/./g, (c) =>
    String.fromCodePoint(127397 + c.charCodeAt(0))
  );
}
// const userList = await userService.getUsersList();
const mockRows: UserRow[] = [];

export default function CallsList({ type }: { type: "audio" | "video" }) {
  const [rows, setRows] = useState<UserRow[]>(mockRows);
  const [search, setSearch] = useState("");

  const columns: Array<DataTableColumn<any>> = [
    {
      header: "ID",
      cell: (r) => <span className="text-primary-600">#{r.id}</span>,
      className: "w-24",
    },
    {
      header: "Caller",
      cell: (r) => (
        <div className="flex items-center gap-3">
          <img
            src={r.caller.profile_pic}
            className="h-8 w-8 rounded-full"
            alt="avatar"
          />
          <div>
            <div className="text-table-text text-sm font-medium">
              {r.caller.first_name} {r.caller.last_name}
            </div>
            {r.caller.username && (
              <div className="text-xs text-text-muted">
                @{r.caller.username}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Chat",
      cell: (r) => (
        <div className="flex items-center gap-3">
          {r.chat && (
            <img
              src={r.chat?.group_icon}
              className="h-8 w-8 rounded-full"
              alt="avatar"
            />
          )}
          <div>
            <div className="text-table-text text-sm font-medium">
              {r.chat?.group_name}
            </div>
            <div className="text-xs text-text-muted">
              {r.chat?.chat_type} Chat
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Call Status",
      cell: (r) => (
        <span
          className={
            r.call_status === "ended"
              ? "text-green-500 border font-medium border-green-300 px-2 py-1 rounded-full text-xs"
              : r.call_status === "ringing"
              ? "text-yellow-700 border font-medium font-bold border-yellow-500 px-2 py-1 rounded-full text-xs"
              : r.call_status === "missed"
              ? "text-red-500 border font-medium font-bold border-red-500 px-2 py-1 rounded-full text-xs"
              : "text-green-500 border font-medium border-green-300 px-2 py-1 rounded-full text-xs"
          }
        >
          {r.call_status}
        </span>
      ),
    },
    {
      header: "Call Duration(sec)",
      accessor: "call_duration",
      // sortable: true,
    },
    {
      header: "Created At",
      cell: (r) =>
        new Date(r.createdAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      sortable: true,
    },
  ];

  // Client-side pagination handled by DataTable; we fetch and combine all pages

  const fetchAll = async () => {
    try {
      const first = await callService.getCallsList({
        page: 1,
        pageSize: 50,
        call_type: type,
      });
      const totalPages: number = first.data?.pagination?.total_pages ?? 1;
      const restPromises = Array.from({
        length: Math.max(0, totalPages - 1),
      }).map((_, i) =>
        callService.getCallsList({
          page: i + 2,
          pageSize: 50,
          call_type: type,
        })
      );
      const rest = await Promise.all(restPromises);
      const allUsers: any[] = [first, ...rest].flatMap(
        (r: any) => r?.data?.call || []
      );
      const mapped: any[] = allUsers.map((u: any, idx: number) => ({
        id: Number(u.call_id ?? idx + 1),
        call_status: u.call_status,
        call_duration: u.call_duration,
        start_time: u.start_time,
        end_time: u.end_time,
        users_count: u.users_count,
        chat: u.Chat,
        caller: u.caller,
        createdAt: u.createdAt,
        call_type: u.call_type,
      }));
      setRows(mapped);
    } catch (e) {
      console.error("Failed to load users list:", e);
      setRows([]);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [type]);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-table-header-text">
        User List
      </h1>

      <div className="flex items-center justify-between ">
        <div className="mt-2">
          <Breadcrumb />
        </div>
        <div className="flex items-center gap-2 relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 font-extrabold text-text-muted" />

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchAll();
            }}
            placeholder="Search by name or number"
            className="pl-9 bg-secondary/80 text-text-muted w-full min-w-[200px]"
          />
        </div>
      </div>
      <DataTable data={rows} columns={columns} defaultPageSize={10} />
    </div>
  );
}
