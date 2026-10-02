import { DataTable, type DataTableColumn, Input, Button } from '@/components/ui';
import { useEffect, useState } from 'react';
import { userService, type UsersListItem } from '@/services/global/userService';
import { Breadcrumb } from '@/layouts';
import { useModal } from '@/providers/ModalProvider';

type BlockedUsersResponse = {
  status: boolean;
  data: {
    Records: UsersListItem[];
    Pagination: {
      total_pages: number;
      total_records: number;
      current_page: number;
      records_per_page: number;
    };
  };
  message: string;
  toast: boolean;
};

type Platform = 'App' | 'Web';
type Status = 'Online' | 'Offline' | 'Blocked';

type UserRow = {
  id: number;
  blocked: {
    user_id: number;
    user_name: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_pic: string;
  },
  blocker: {
    user_id: number;
    user_name: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_pic: string;
  }
};


export default function BlockedUserListPage() {
  const mockRows: UserRow[] = [];
  const [rows, setRows] = useState<UserRow[]>(mockRows);
  const [search, setSearch] = useState('');

  function countryFlag(code: string) {
    // Use emoji flags for portability
    const cc = code.toUpperCase();
    return cc.replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
  }
  // const userList = await userService.getUsersList();

  const columns: Array<DataTableColumn<any>> = [
    {
      header: 'ID',
      cell: (r) => (
        <span className="text-primary-600">#{r.id}</span>
      ),
      className: 'w-24',
    },
     {
       header: 'Fecha',
       cell: (r) => new Date(r.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
       sortable: true,
     },
    {
      header: 'Bloqueado Por',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <img src={r.block_by.profile_pic} className="h-8 w-8 rounded-full" alt="avatar" />
          <div>
            <div className="text-gray-900 text-sm font-medium">{r.block_by.full_name}</div>
            <div className="text-gray-500 text-sm font-extralight">{r.block_by.user_name}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Bloqueado A',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <img src={r.block_to.profile_pic} className="h-8 w-8 rounded-full" alt="avatar" />
          <div>
            <div className="text-gray-900 text-sm font-medium">{r.block_to.full_name}</div>
            <div className="text-gray-500 text-sm font-extralight">{r.block_to.user_name}</div>
          </div>
        </div>
      ),
    },
  ];
  // Client-side pagination handled by DataTable; we fetch and combine all pages

  const fetchAll = async (searchTerm: string) => {
    try {
      const first = await userService.getBlockedUserList({ page: 1, pageSize: 50, search: searchTerm }) as unknown as BlockedUsersResponse;
      console.log('Blocked users API response:', first); // Debug log to see actual response structure

      const totalPages: number = first.data?.Pagination?.total_pages ?? 1;
      const restPromises = Array.from({ length: Math.max(0, totalPages - 1) }).map((_, i) =>
        userService.getBlockedUserList({ page: i + 2, pageSize: 50, search: searchTerm })
      );
      const rest = await Promise.all(restPromises);

      // Extract blocked users from Records field
      const allUsers: UsersListItem[] = [first, ...rest]
        .flatMap((r: any) => r?.data?.Records || []);

      const mapped: any[] = allUsers.map((u: UsersListItem, idx: number) => ({
        id: Number(u.user_id ?? idx + 1),
        block_to: {
          user_id: u.blocked.user_id,
          user_name: u.blocked.user_name,
          email: u.blocked.email,
          first_name: u.blocked.first_name,
          last_name: u.blocked.last_name,
          profile_pic: u.blocked.profile_pic,
        },
        block_by: {
          user_id: u.blocker.user_id,
          user_name: u.blocker.user_name,
          email: u.blocker.email,
          first_name: u.blocker.first_name,
          last_name: u.blocker.last_name,
          profile_pic: u.blocker.profile_pic,
        },
        date: u.createdAt
      }));
      setRows(mapped);
    } catch (e) {
      console.error('Failed to load blocked users list:', e);
      setRows([]);
    }
  };

  useEffect(() => {
    fetchAll(search);
  }, [search]);
  return (
    <div className="space-y-4">
      <div className="mt-2">
        <Breadcrumb />
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Lista de Usuarios Bloqueados</h1>
        <div className="flex items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') fetchAll(search);
            }}
            placeholder="Buscar por nombre o número"
            className="w-72"
          />
          <Button
            variant="secondary"
            className="text-black"
            onClick={() => { fetchAll(search); }}
          >
            Buscar
          </Button>
        </div>
      </div>
      <DataTable data={rows} columns={columns} defaultPageSize={10} />
    </div>
  );
}


