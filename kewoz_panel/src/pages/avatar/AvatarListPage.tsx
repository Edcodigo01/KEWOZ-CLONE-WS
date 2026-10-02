import { useState, useEffect } from 'react';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { avatarService, type Avatar } from '@/services/global/avatarService';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { AvatarForm } from '@/components/forms/AvatarForm';
import { Modal } from '@/components/ui/Modal';
import { Breadcrumb } from '@/layouts';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { useDemoGuard } from '@/utils/demoGuard';

interface AvatarListProps {
  refreshTrigger?: number;
}

export default function AvatarList({ refreshTrigger }: AvatarListProps) {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAvatar, setEditingAvatar] = useState<Avatar | null>(null);
  const [deletingAvatar, setDeletingAvatar] = useState<Avatar | null>(null);
  const [viewingAvatar, setViewingAvatar] = useState<Avatar | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { checkDemo } = useDemoGuard();

  const fetchAvatars = async () => {
    try {
      setLoading(true);
      const response = await avatarService.getAvatarList();

      if (response.status && response.data?.Records) {
        setAvatars(response.data.Records);
      } else {
        throw new Error(response.message || 'Failed to fetch avatars');
      }
    } catch (error) {
      console.error('Error fetching avatars:', error);
      toast({
        title: 'Error',
        description: 'Failed to load avatars. Please try again.',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvatars();
  }, [refreshTrigger]);

  const handleView = (avatar: Avatar) => {
    setViewingAvatar(avatar);
  };

  const handleCloseView = () => {
    setViewingAvatar(null);
  };

  const handleEdit = (avatar: Avatar) => {
    setEditingAvatar(avatar);
  };

  const handleCloseEdit = () => {
    setEditingAvatar(null);
  };

  const handleAvatarUpdate = (updatedAvatar: Avatar) => {
    setAvatars(prevAvatars =>
      prevAvatars.map(avatar =>
        avatar.avatar_id === updatedAvatar.avatar_id ? updatedAvatar : avatar
      )
    );
    setEditingAvatar(null);
  };

  const handleDelete = (avatar: Avatar) => {
    setDeletingAvatar(avatar);
  };

  const handleConfirmDelete = async () => {
    if (checkDemo()) return;

    if (!deletingAvatar) return;

    setIsDeleting(true);
    try {
      const response = await avatarService.deleteAvatar(deletingAvatar.avatar_id);

      if (response.status) {
        toast({
          title: 'Success!',
          description: 'Avatar deleted successfully!',
          variant: 'success'
        });

        // Remove the deleted avatar from the state
        setAvatars(prevAvatars =>
          prevAvatars.filter(avatar => avatar.avatar_id !== deletingAvatar.avatar_id)
        );
        setDeletingAvatar(null);
      } else {
        throw new Error(response.message || 'Failed to delete avatar');
      }
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete avatar. Please try again.',
        variant: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeletingAvatar(null);
  };

  const columns: DataTableColumn<Avatar>[] = [
    {
      id: 'avatar_id',
      header: 'ID',
      accessor: 'avatar_id',
      sortable: true,
      className: 'w-20'
    },
    {
      id: 'avatar_media',
      header: 'Avatar',
      cell: (avatar) => (
        <div className="flex items-center">
          {avatar.avatar_media ? (
            <img
              src={avatar.avatar_media}
              alt={avatar.name}
              className="w-12 h-12 rounded-full object-cover border"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-avatar.png';
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full  flex items-center justify-center">
              <span className="text-gray- text-xs">No Image</span>
            </div>
          )}
        </div>
      ),
      className: 'w-20'
    },
    {
      id: 'name',
      header: 'Name',
      accessor: 'name',
      sortable: true,
    },
    {
      id: 'avatar_gender',
      header: 'Gender',
      cell: (avatar) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
          {avatar.avatar_gender}
        </span>
      ),
      sortable: true,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (avatar) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${avatar.status
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
          }`}>
          {avatar.status ? 'Active' : 'Inactive'}
        </span>
      ),
      sortable: true,
    },
    {
      id: 'createdAt',
      header: 'Created',
      cell: (avatar) => (
        <span className="text-sm ">
          {new Date(avatar.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      ),
      sortable: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (avatar) => (
        <div className="flex items-center space-x-2 ">
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(avatar)}
            className="p-1 h-8 w-8"
            title="View Avatar"
          >
            <Eye className="h-4 w-4 text-green-500" />
          </Button> */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(avatar)}
            className="p-1 h-8 w-8"
            title="Edit Avatar"
          >
            <Edit className="h-4 w-4 text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(avatar)}
            className="p-1 h-8 w-8 text-red-600 hover:text-red-700"
            title="Delete Avatar"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'w-32'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-text-muted">Loading avatars...</span>
      </div>
    );
  }

  return (
    <div className="">
      <div className="mt-2">
        <Breadcrumb />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-muted">Avatar List</h1>
      </div>

      <DataTable
        data={avatars}
        columns={columns}
        defaultPageSize={10}
        pageSizeOptions={[10, 20, 50]}
      // className="bg-white"
      />

      {/* Edit Avatar Modal */}
      <Modal
        isOpen={!!editingAvatar}
        onClose={handleCloseEdit}
        title="Edit Avatar"
        size="sm"
      >
        {editingAvatar && (
          <div className="p-6">

            <AvatarForm avatar={editingAvatar} mode="edit" onUpdate={handleAvatarUpdate} />
          </div>
        )}
      </Modal>

      {/* View Avatar Modal */}
      {viewingAvatar && (
        <Modal
          isOpen={!!viewingAvatar}
          onClose={handleCloseView}
          title="View Avatar"
          size="sm"
        >

          <div className="space-y-4">
            {/* Avatar Image */}
            <div className="flex justify-center">
              {viewingAvatar.avatar_media ? (
                <img
                  src={viewingAvatar.avatar_media}
                  alt={viewingAvatar.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-avatar.png';
                  }}
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                  <span className="text-gray-500 text-xs sm:text-sm">No Image</span>
                </div>
              )}
            </div>

            {/* Avatar Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                <p className="text-sm text-gray-900">{viewingAvatar.avatar_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-sm text-gray-900">{viewingAvatar.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                  {viewingAvatar.avatar_gender}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${viewingAvatar.status
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                  }`}>
                  {viewingAvatar.status ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <p className="text-sm text-gray-900">
                  {new Date(viewingAvatar.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Updated</label>
                <p className="text-sm text-gray-900">
                  {new Date(viewingAvatar.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingAvatar}
        onClose={handleCancelDelete}
        title="Delete Avatar"
        size="sm"
      >
        {deletingAvatar && (
          <div className="space-y-4 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{deletingAvatar.name}"?
                  <br />
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                style={{ backgroundColor: '#dc2626', borderColor: 'transparent' }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626'}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}