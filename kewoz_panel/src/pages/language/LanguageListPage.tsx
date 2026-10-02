import React, { useEffect, useState } from "react";
import { DataTable, type DataTableColumn, Button, Modal, Toggle } from "@/components/ui";
import { languageService, type LanguageItem } from "@/services/global/languageService";
import { Breadcrumb } from "@/layouts";
import { Edit, Languages } from "lucide-react";
import { EditLanguageForm } from "@/components/forms/EditLanguageForm";
import { useNavigate } from "react-router";
import { useDemoGuard } from "@/utils/demoGuard";

type LanguageRow = {
  id: number;
  language: string;
  languageShort: string;
  language_alignment: string;
  country: string;
  status: boolean;
  defaultStatus: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function LanguageListPage() {
  const navigate = useNavigate(); // 👈 for navigation

  const [rows, setRows] = useState<LanguageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [edit, setEdit] = useState<Partial<LanguageItem> | null>()
  const { checkDemo } = useDemoGuard();

  const handleLanguageUpdate = (updatedLanguage: any) => {

    setRows(prevAvatars =>
      prevAvatars.map(language =>
        language.id === updatedLanguage.language_id ? { ...language, ...updatedLanguage } : language
      )
    );
    setEdit(null);
  };
  function handleEdit(r: any) {

    setEdit({
      language_id: r.id,
      language: r.language,
      language_alignment: r.language_alignment,
      country: r.country
    });
  }

  const columns: Array<DataTableColumn<LanguageRow>> = [
    {
      header: "ID",
      cell: (r) => <span className="text-primary-600">#{r.id}</span>,
      className: "w-20",
    },
    {
      header: "Idioma",
      cell: (r) => (
        <div>
          <div className="text-table-text text-sm font-medium">{r.language}</div>
          <div className="text-xs text-text-muted">{r.languageShort}</div>
        </div>
      ),
    },
    {
      header: "País",
      accessor: "country",
      cell: (r) => <span className="text-primary-600">{r.country}</span>,

      sortable: true,
    },
    {
      header: "Alineación del Idioma",
      cell: (r) => (
        <span
          className={
            r.language_alignment
              ? "text-green-600 border border-emerald-100 px-2 py-1 rounded-full text-xs"
              : "text-red-500 border border-red-400 px-2 py-1 rounded-full text-xs"
          }
        >
          {r.language_alignment}
        </span>
      ),
      // className: "w-24",
    },
    // {
    //   header: "Created",
    //   cell: (r) =>
    //     new Date(r.createdAt).toLocaleDateString(undefined, {
    //       year: "numeric",
    //       month: "short",
    //       day: "numeric",
    //     }),
    //   sortable: true,
    //   className: "w-32",
    // },
    {
      header: "Estado",
      cell: (r) => (

        <Toggle
          checked={r.status}
          onChange={async (checked) => {
            // 1. update UI immediately
            if (checkDemo()) return;
            setRows((prev) =>
              prev.map((row) =>
                row.id == r.id ? { ...row, status: checked } : row
              )
            );

            try {
              // 2. call API
              await languageService.editLanguage(
                r.id,
                {
                  status: checked
                },
              );
            } catch (err) {
              console.error('Block toggle failed', err);

              // 3. revert if API fails
              setRows((prev) =>
                prev.map((row) =>
                  row.id === r.id ? { ...row, status: !checked } : row
                )
              );
            }
          }}
          className="p-2"
        />
      ),
      className: "w-24",
    },
    {
      header: "Predeterminado",
      cell: (r) => (
        <Toggle
          checked={r.defaultStatus}
          disabled={rows.length == 1}
          onChange={async (checked) => {
            if (checkDemo()) return;

            setRows((prev) => {
              if (checked) {
                // ✅ Normal behavior: set current row true, others false
                return prev.map((row) =>
                  row.id === r.id
                    ? { ...row, defaultStatus: true, status: true }
                    : { ...row, defaultStatus: false }
                );
              } else {
                // ❌ Turning OFF
                const sorted = [...prev].sort((a, b) => a.id - b.id);

                if (!sorted[0] || !sorted[1]) return prev; // nothing to do

                const isLowest = r.id === sorted[0].id;

                let fallbackId: number = sorted[0].id; // safe default

                if (isLowest && sorted.length > 1) {
                  // pick the next higher id if it exists
                  fallbackId = sorted[1].id;
                } else if (!isLowest) {
                  // fallback to lowest
                  fallbackId = sorted[0].id;
                }

                return prev.map((row) => ({
                  ...row,
                  defaultStatus: row.id === fallbackId,
                }));
              }
            });

            try {
              // 🔥 Call API for current toggle
              await languageService.editLanguage(r.id, {
                default_status: checked,
                ...(checked && { status: true })
              });

              if (!checked) {
                // Find fallback in current state
                const sorted = [...rows].sort((a, b) => a.id - b.id);
                if (sorted[0] && sorted[1]) {
                  const isLowest = r.id === sorted[0].id;
                  let fallbackId: number = sorted[0].id;

                  if (isLowest && sorted.length > 1) {
                    fallbackId = sorted[1].id;
                  }

                  if (fallbackId !== r.id) {
                    await languageService.editLanguage(fallbackId, {
                      default_status: true,
                    });
                  }
                }
              }
            } catch (err) {
              console.error("Toggle failed", err);

              // ⏪ Revert if API fails
              setRows((prev) =>
                prev.map((row) =>
                  row.id === r.id ? { ...row, defaultStatus: !checked } : row
                )
              );
            }
          }}
          className="p-2"
        />



      ),
      className: "w-24",
    },

    {
      header: 'Acciones',
      cell: (r) => (
        <div className="flex items-center gap-2">
          {/* Edit Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(r)}
            className="p-1 h-8 w-8"
            title="Editar Idioma"
          >
            <Edit className="h-4 w-4 text-blue-500" />
          </Button>

          {/* Translation Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/language/translated-words/${r.id}`)} // 👈 navigate with language id
            className="p-1 h-8 w-8"
            title="Gestionar Traducciones"
          >
            <Languages className="h-4 w-4 text-green-500" />
          </Button>
        </div>
      ),
    }



  ];

  const fetchLanguages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await languageService.getLanguageList({
        page: 1,
        limit: 50,
      });

      console.log("API Response:", response); // Debug log
      // Handle different possible response structures
      let records: any[] = [];

      if (response.status) {
        // Try different possible data structures
        if (response.data?.Records) {
          records = response.data.Records;
        } else if (response.data && Array.isArray(response.data)) {
          records = response.data;
        } else if (Array.isArray(response)) {
          records = response;
        }
        if (records && records.length > 0) {
          const mapped: LanguageRow[] = records.map((lang: any) => ({
            id: lang.language_id || lang.id,
            language: lang.language || lang.name || "Desconocido",
            languageShort: lang.language_short || lang.short || lang.code || "",
            country: lang.country || "Desconocido",
            status: lang.status !== undefined ? lang.status : true,
            language_alignment: lang.language_alignment || "Desconocido",
            defaultStatus:
              lang.default_status !== undefined ? lang.default_status : false,
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
        setError(response.message || "Error al cargar los idiomas");
      }
    } catch (e) {
      console.error("Failed to load languages:", e);
      setError("Error al cargar los idiomas");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
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

      <DataTable data={rows} columns={columns} defaultPageSize={10} />{/* Edit Avatar Modal */}
      <Modal
        isOpen={!!edit}
        onClose={() => setEdit(null)}
        title="Editar Idioma"
        size="sm"
      >
        {edit && (
          <div className="p-6">

            <EditLanguageForm language={edit} mode="edit" onUpdate={handleLanguageUpdate} />
            {/* // onUpdate={handleLanguageUpdate} */}
          </div>
        )}
      </Modal>
    </div>
  );
}
