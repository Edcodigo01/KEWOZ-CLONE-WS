import React, { useEffect, useState } from "react";
import {
  DataTable,
  type DataTableColumn,
  useToast,
  Toggle,
} from "@/components/ui";
import { Breadcrumb } from "@/layouts";
import { reportService } from "@/services/global/reportService";
import { useDemoGuard } from "@/utils/demoGuard";

export default function ReportTypesListPage() {
  interface ReportTypeRow {
    report_type_id: number;
    report_text: string;
    report_for: string;
    is_deleted: boolean;
    createdAt: string;
    updatedAt: string;
  }

  const [rows, setRows] = useState<ReportTypeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { checkDemo } = useDemoGuard();

  const handleDelete = async ({
    id,
    shouldDelete,
  }: {
    id: number;
    shouldDelete: boolean;
  }) => {
    try {
      if (checkDemo()) return;
      const response = await reportService.deleteReportType({ id, shouldDelete });

      if (response.status === true) {
        // Update the local state to reflect the change
        setRows(prevRows => 
          prevRows.map(row => 
            row.report_type_id === id 
              ? { ...row, is_deleted: !shouldDelete, updatedAt: new Date().toISOString() }
              : row
          )
        );
        
        toast({
          title: "¡Éxito!",
          description: `Tipo de reporte ${shouldDelete ? 'restaurado' : 'eliminado'} con éxito!`,
          variant: "success",
        });
      }
    } catch (error) {
      console.error('Error updating report type status:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el estado del tipo de reporte",
        variant: "error",
      });
    }
  };

  const columns: Array<DataTableColumn<ReportTypeRow>> = [
    {
      header: "ID",
      cell: (r) => (
        <span className="text-primary-600">#{r.report_type_id}</span>
      ),
      className: "w-20",
    },
    {
      header: "Texto del Reporte",
      cell: (r) => (
        <div>
          <div className="text-table-text text-sm font-medium">
            {r.report_text}
          </div>
          <div className="text-xs text-text-muted">{r.report_for}</div>
        </div>
      ),
    },
    {
      header: "Reporte Para",
      accessor: "report_for",
      sortable: true,
    },

    {
      header: "Creado",
      cell: (r) =>
        new Date(r.createdAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      sortable: true,
      className: "w-32",
    },
    
    {
      header: "Activo",
      cell: (r) => (
        <div className="flex items-center gap-2">
          <Toggle
            checked={!r.is_deleted}
            onChange={(checked) =>
              {
                handleDelete({
                  id: r.report_type_id,
                  shouldDelete: checked, // true = not deleted, false = deleted
                })
              }
            }
            className="p-2"
          ></Toggle>
        </div>
      ),
      className: "w-32",
    },
  ];

  const fetchReportTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportService.getReportTypesList();

      // Handle different possible response structures
      let records: any[] = [];

      if (response.status) {
        // Try different possible data structures
        if (response.data?.ReportTypes) {
          records = response.data.ReportTypes;
        } else if (response.data && Array.isArray(response.data)) {
          records = response.data;
        }
        if (records && records.length > 0) {
          const mapped: ReportTypeRow[] = records.map((lang: any) => ({
            report_type_id: lang.report_type_id || lang.id,
            report_text: lang.report_text || lang.name || "Desconocido",
            report_for: lang.report_for || lang.short || lang.code || "",
            is_deleted: lang.is_deleted,
            createdAt:
              lang.createdAt || lang.created_at || new Date().toISOString(),
            updatedAt:
              lang.updatedAt || lang.updated_at || new Date().toISOString(),
          }));
          setRows(mapped);
        } else {
          setRows([]);
        }
      } else {
        console.log("Response structure:", response); // Debug log
        setError(response.message || "Error al cargar los tipos de reporte");
      }
    } catch (e) {
      console.error("Failed to load Report types:", e);
      setError("Error al cargar los tipos de reporte");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportTypes();
  }, []);

  return (
    <div className="space-y-4">
      <div className="mt-2">
        <Breadcrumb />
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <DataTable data={rows} columns={columns} defaultPageSize={10} />
    </div>
  );
}
