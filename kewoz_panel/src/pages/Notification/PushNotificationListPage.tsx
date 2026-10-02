import { useState, useEffect } from 'react';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Breadcrumb } from '@/layouts';
import { pushNotificationService, type Record as Notification } from '@/services/global/PushNotificationService';

export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotification = async () => {
    try {
      setLoading(true);
      const response = await pushNotificationService.notificationList();

      if (response.status && response.data?.Records) {
        setNotifications(response.data.Records);
      } else {
        throw new Error(response.message || 'Error al obtener la lista de notificaciones');
      }
    } catch (error) {
      console.error('Error fetching notification List:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar la lista de notificaciones. Por favor, inténtelo de nuevo.',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotification();
  }, []);

  const columns: DataTableColumn<Notification>[] = [
    {
      id: 'notification_id',
      header: 'ID',
      accessor: 'notification_id',
      className: 'w-20'
    },
    {
      id: 'title',
      header: 'Título',
      accessor: 'title',
    },
    {
      id: 'message',
      header: 'Mensaje',
      accessor: 'message',
      cell: (notification) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ">
          {notification.message}
        </span>
      ),
    },
    {
      id: 'users',
      header: 'Vistas',
      cell: (notification) => (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
          {notification.users?.length || 0}
        </span>
      ),
      sortable: true,
    },
    {
      id: 'createdAt',
      header: 'Fecha',
      cell: (notification) => (
        <span className="text-sm">
          {new Date(notification.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      ),
    },
  ];

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center py-12">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  //       <span className="ml-2 text-text-muted">Loading notifications...</span>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-table-header-text">Lista de Notificaciones</h1>
      <div className="flex items-center justify-between">
        <div className="mt-2">

          <Breadcrumb />
        </div>
      </div>
      <div className="">
        <DataTable
          columns={columns}
          data={notifications}
          // emptyMessage="No notifications found"
          // onRefresh={fetchNotification}
          // loading={loading}
          defaultPageSize={10}
        />
      </div>
    </div>
  );
}