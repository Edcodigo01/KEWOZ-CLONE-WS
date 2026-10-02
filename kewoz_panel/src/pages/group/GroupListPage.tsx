import { DataTable, type DataTableColumn, Button, Modal, Input } from '@/components/ui';
import { useState, useEffect } from 'react';
import { groupService, type Chat } from '@/services/global/groupService';
import { Breadcrumb } from '@/layouts';
import { Search, Eye, Pencil, Trash2, Loader } from 'lucide-react';

// Types moved to groupService

type GroupRow = {
  id: number;
  group_icon: string;
  group_name: string;
  group_description: string;
  is_group_blocked: string;
  countryCode: string; // ISO alpha-2
  country: string;
  createdAt: string; // ISO date
  participants: Chat['participants'];
};

const columns: Array<DataTableColumn<GroupRow>> = [
  {
    header: 'ID',
    cell: (r: GroupRow) => (
      <span className="text-primary-600">#{r.id}</span>
    ),
    className: 'w-24',
  },
  {
    header: 'Nombre Completo',
    cell: (r: GroupRow) => (
      <div className="flex items-center gap-3">
        <img src={r.group_icon} className="h-8 w-8 rounded-full" alt="avatar" />
        <div>
          <div className="text-table-text text-sm font-medium">{r.group_name}</div>
          <div className="text-xs text-text-muted">{r.group_description}</div>
        </div>
      </div>
    ),
  },
  // {
  //   header: 'User Name',
  //   accessor: '',
  //   sortable: true,
  // },
  // {
  //   header: 'Country',
  //   cell: (r) => (
  //     <div className="inline-flex items-center gap-2">
  //       <span className="text-lg leading-none">{countryFlag(r.countryCode)}</span>
  //       <span className="text-sm text-table-text">{r.country}</span>
  //     </div>
  //   ),
  // },

  {
    header: 'Participantes',
    cell: (r: GroupRow) => (
      <span >
        {r.participants.length}
      </span>
    ),
    sortable: true,
    accessor: 'participants'
  },
  {
    header: 'Fecha de Creación',
    accessor: 'createdAt',
    cell: (r: GroupRow) => new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
    sortable: true,
  },

  {
    header: 'Acciones',
    cell: (row: GroupRow) => <ActionsCell group={row} onEdit={handleEditGroup} />,
    className: 'w-32',
  },
];

const ActionsCell = ({ group, onEdit }: { group: GroupRow; onEdit: (g: GroupRow) => void }) => {
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await groupService.deleteGroupById(group.id);
      setIsDeleteOpen(false);
      window.location.reload();
    } catch (e) {
      console.error('Error deleting group:', e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="inline-flex items-center gap-2 w-full">
        <button
          onClick={(e) => { e.stopPropagation(); setIsMembersOpen(true); }}
          className="p-2 rounded-md text-text-muted hover:text-primary-dark hover:bg-secondary-light transition-colors"
          title="Ver Miembros"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(group); }}
          className="p-2 rounded-md text-text-muted hover:text-primary-dark hover:bg-secondary-light transition-colors"
          title="Editar Grupo"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setIsDeleteOpen(true); }}
          className="p-2 rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Eliminar Grupo"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <MembersModal
        isOpen={isMembersOpen}
        onClose={() => setIsMembersOpen(false)}
        group={group}
      />

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Eliminar Grupo"
        size="sm"
      >
        <div className="p-6 space-y-4">
          <p className="text-text-muted text-sm">
            ¿Estás seguro de que deseas eliminar el grupo <strong>{group.group_name}</strong>? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isDeleting && <Loader className="h-4 w-4 animate-spin" />}
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const MembersModal = ({
  isOpen,
  onClose,
  group
}: {
  isOpen: boolean;
  onClose: () => void;
  group: GroupRow | null
}) => {
  if (!group) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${group.group_name} - Miembros (${group.participants?.length || 0})`}
      size="md"

    >
      <div className="space-y-4 p-6">
        <div className="max-h-[60vh] overflow-y-auto">
          {group.participants?.length ? (
            <ul className="divide-y divide-table-divider">
              {group.participants.map((participant, index) => (
                <li key={index} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={participant.User?.profile_pic || '/default-avatar.png'}
                      alt={participant.User?.full_name || 'User'}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-bold text-text-muted">
                        {participant.User?.full_name || 'Usuario Desconocido'}
                      </p>
                      <p className="text-sm text-text-muted">
                        @{participant.User?.user_name || 'sinusuario'}
                      </p>
                    </div>
                  </div>
                  {participant.is_creator ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-dark text-white">
                    Admin
                  </span> : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                    Miembro
                  </span>}

                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center font-bold text-text-muted py-4">No se encontraron miembros en este grupo.</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default function GroupListPage() {
  const [rows, setRows] = useState<GroupRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumnIndex, setSortColumnIndex] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [editingGroup, setEditingGroup] = useState<GroupRow | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleEditGroup = (group: GroupRow) => {
    setEditingGroup(group);
    setEditName(group.group_name);
    setEditDescription(group.group_description);
  };

  const handleSaveEdit = async () => {
    if (!editingGroup) return;
    setIsSaving(true);
    try {
      await groupService.updateGroup(editingGroup.id, {
        group_name: editName,
        group_description: editDescription,
      });
      setEditingGroup(null);
      window.location.reload();
    } catch (e) {
      console.error('Error updating group:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const columns: Array<DataTableColumn<GroupRow>> = [
    {
      header: 'ID',
      cell: (r: GroupRow) => (
        <span className="text-primary-600">#{r.id}</span>
      ),
      className: 'w-24',
    },
    {
      header: 'Nombre Completo',
      cell: (r: GroupRow) => (
        <div className="flex items-center gap-3">
          <img src={r.group_icon} className="h-8 w-8 rounded-full" alt="avatar" />
          <div>
            <div className="text-table-text text-sm font-medium">{r.group_name}</div>
            <div className="text-xs text-text-muted">{r.group_description}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Participantes',
      cell: (r: GroupRow) => (
        <span >
          {r.participants.length}
        </span>
      ),
      sortable: true,
      accessor: 'participants'
    },
    {
      header: 'Fecha de Creación',
      accessor: 'createdAt',
      cell: (r: GroupRow) => new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
      sortable: true,
    },
    {
      header: 'Acciones',
      cell: (row: GroupRow) => <ActionsCell group={row} onEdit={handleEditGroup} />,
      className: 'w-32',
    },
  ];

  // Debounce search is now handled in the main effect
  // Remove the separate debounce effect since we're handling it in the main effect

  // Handle data fetching
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);

        // Get sort field from columns if sort is active
        let sortField: string | undefined;
        if (sortColumnIndex !== null && sortColumnIndex < columns.length) {
          const sortColumn = columns[sortColumnIndex];
          if (sortColumn && sortColumn.accessor && typeof sortColumn.accessor === 'string') {
            sortField = sortColumn.accessor;
          }
        }

        const params: any = {
          page: pagination.currentPage,
          pageSize: pagination.itemsPerPage,
        };

        // Only add sort parameters if we have a sort field
        if (sortField) {
          console.log("sortby", sortField);

          if (sortField == "participants") {
            params.sortBy = "user_count"
          }
          else {

            params.sortBy = sortField;
          }
          params.sortOrder = sortDirection;
        }

        // Add search term if provided
        if (searchTerm) {
          params.search = searchTerm;
        }
        console.log("params", params);

        const response = await groupService.getGroupList(params);

        if (!isMounted) return;

        const data = response?.data || {};
        const groups = data.chats || [];
        const paginationData = data.pagination || {};

        setPagination(prev => ({
          ...prev,
          currentPage: pagination.currentPage || 1,
          itemsPerPage: paginationData.pageSize || 1,
          totalItems: paginationData.total || 0,
          totalPages: paginationData.total_pages || 1,
        }));

        const mapped: GroupRow[] = groups.map((chat: Chat) => {
          // Safely handle createdAt date
          let createdAt: string;
          try {
            const dateValue = (chat as any).createdAt || (chat as any).created_at;
            createdAt = dateValue ? new Date(dateValue).toISOString() : new Date().toISOString();
          } catch (e) {
            console.warn('Error parsing date, using current date', e);
            createdAt = new Date().toISOString();
          }

          return {
            id: chat.chat_id,
            group_icon: chat.group_icon || '/assets/group-default.png',
            group_name: chat.group_name || 'Grupo sin nombre',
            group_description: chat.group_description || '',
            is_group_blocked: chat.is_group_blocked ? 'Blocked' : 'Active',
            countryCode: 'IN',
            country: 'India',
            createdAt,
            participants: chat.participants || []
          };
        });

        setRows(mapped);
      } catch (e) {
        if (isMounted) {
          console.error('Failed to load Group list:', e);
          setRows([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [pagination.currentPage, pagination.itemsPerPage, sortColumnIndex, sortDirection, searchTerm]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage: pageSize,
      currentPage: 1 // Reset to first page when changing page size
    }));
  };

  const handleSearch = () => {
    // The search is now handled by the main effect which watches searchTerm
    // Just reset to first page when search is triggered
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  const handleSortChange = (columnIndex: number | null, direction: 'ASC' | 'DESC') => {
    console.log("hitted", columnIndex);

    setSortColumnIndex(columnIndex);
    setSortDirection(direction);
    // Reset to first page when sorting changes
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  return (
    <div className="space-y-4">
      <div className="mt-2">
        <div className="mb-5">
          <Breadcrumb />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-muted">Lista de Grupos</h1>
        <div className="flex items-center gap-2 relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 font-extrabold text-text-muted" />

          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}

            placeholder="Buscar por nombre o número"
            className="pl-9 bg-secondary/80 text-text-muted w-full min-w-[200px]"
          />
        </div>

        
      </div>
      <DataTable
        data={rows}
        columns={columns}
        className={isLoading ? 'opacity-50' : ''}
        // Controlled pagination props
        currentPage={pagination.currentPage}
        itemsPerPage={pagination.itemsPerPage}
        totalItems={pagination.totalItems}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        sortColumnIndex={sortColumnIndex}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        serverPagination={true}
      />

      <Modal
        isOpen={!!editingGroup}
        onClose={() => setEditingGroup(null)}
        title="Editar Grupo"
        size="md"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Nombre del Grupo</label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full border border-table-divider"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Descripción</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full border border-table-divider rounded-md px-3 py-2 text-sm text-text-muted bg-secondary resize-none"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setEditingGroup(null)}>
              Cancelar
            </Button>
            <button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-dark rounded-md hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <Loader className="h-4 w-4 animate-spin" />}
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
