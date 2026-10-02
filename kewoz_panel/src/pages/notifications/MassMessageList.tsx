import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Loader, Image as ImageIcon, Users } from "lucide-react";
import { Button, DataTable, type DataTableColumn } from "@/components/ui";
import { Breadcrumb } from "@/layouts";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import {
    notificationService,
    type MassMessageListItem,
} from "@/services/global/notificationService";
import { ROUTES } from "@/config/routes";

function CountryFlagImg({ code }: { code: string }) {
    const cc = (code || "").toUpperCase();
    if (!cc || cc.length !== 2) return null;
    return (
        <img
            src={`https://flagcdn.com/w20/${cc.toLowerCase()}.png`}
            alt={cc}
            className="inline-block w-5 h-[13px] rounded-sm object-cover"
            onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
            }}
        />
    );
}

export default function MassMessageList() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [messages, setMessages] = useState<MassMessageListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [selected, setSelected] = useState<MassMessageListItem | null>(null);

    const fetchList = async (page: number, size: number) => {
        setLoading(true);
        try {
            const res = await notificationService.getMassMessages(page, size);
            if (res.status && res.data?.Records) {
                setMessages(res.data.Records);
                setTotalItems(res.data.Pagination?.total_records ?? 0);
            } else {
                throw new Error(res.message || "Error al cargar mensajes");
            }
        } catch (err) {
            console.error("Error fetching mass messages:", err);
            toast({
                title: "Error",
                description: "No se pudo cargar la lista de mensajes",
                variant: "error",
            });
            setMessages([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const columns: DataTableColumn<MassMessageListItem>[] = [
        {
            id: "notification_id",
            header: "ID",
            cell: (row) => <span className="text-primary-600">#{row.notification_id}</span>,
            className: "w-20",
        },
        {
            id: "title",
            header: "Título",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    {row.image_url && (
                        <img
                            src={row.image_url}
                            alt=""
                            className="h-8 w-8 rounded object-cover border border-table-divider"
                        />
                    )}
                    <span className="text-sm font-medium text-table-text">
                        {row.title}
                    </span>
                </div>
            ),
        },
        {
            id: "message",
            header: "Mensaje",
            cell: (row) => (
                <span className="text-sm text-text-muted line-clamp-1 max-w-xs">
                    {row.message}
                </span>
            ),
        },
        {
            id: "filter",
            header: "Filtro",
            cell: (row) => {
                if (row.filter_type === "all") {
                    return (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            <Users className="h-3 w-3" />
                            Todos
                        </span>
                    );
                }
                const countries = row.filter_countries || [];
                return (
                    <div className="flex flex-wrap items-center gap-1">
                        {countries.slice(0, 4).map((c) => (
                            <span
                                key={c}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-gray-50 border border-table-divider"
                            >
                                <CountryFlagImg code={c} />
                                {c}
                            </span>
                        ))}
                        {countries.length > 4 && (
                            <span className="text-xs text-text-muted">
                                +{countries.length - 4}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            id: "target",
            header: "Enviados",
            cell: (row) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                    {row.sent_count || row.target_count || 0}
                </span>
            ),
        },
        {
            id: "status",
            header: "Estado",
            cell: (row) => {
                const isFailed = row.status === "failed";
                return (
                    <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            isFailed
                                ? "bg-red-50 text-red-700 border border-red-100"
                                : row.status === "no_tokens"
                                ? "bg-orange-50 text-orange-700 border border-orange-100"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        }`}
                    >
                        {isFailed ? "Fallido" : row.status === "no_tokens" ? "Sin tokens" : "Enviado"}
                    </span>
                );
            },
        },
        {
            id: "createdAt",
            header: "Fecha",
            cell: (row) => (
                <span className="text-sm text-text-muted">
                    {new Date(row.createdAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </span>
            ),
        },
        {
            id: "actions",
            header: "Acción",
            cell: (row) => (
                <button
                    onClick={() => setSelected(row)}
                    className="text-sm text-primary-600 hover:underline"
                >
                    Ver detalle
                </button>
            ),
            className: "w-32",
        },
    ];

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-semibold text-table-header-text">
                Lista de Mensajes Masivos
            </h1>

            <div className="flex items-center justify-between">
                <Breadcrumb />
                <Button
                    onClick={() => navigate(ROUTES.MASS_MESSAGES.SEND)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-button-text font-semibold rounded-md hover:opacity-90 transition whitespace-nowrap"
                >
                    <Send className="h-4 w-4" />
                    Enviar Mensaje Masivo
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader className="h-6 w-6 animate-spin text-primary-600" />
                </div>
            ) : (
                <DataTable
                    data={messages}
                    columns={columns}
                    serverPagination
                    currentPage={currentPage}
                    itemsPerPage={pageSize}
                    totalItems={totalItems}
                    onPageChange={(p) => setCurrentPage(p)}
                    onPageSizeChange={(s) => {
                        setPageSize(s);
                        setCurrentPage(1);
                    }}
                    defaultPageSize={10}
                />
            )}

            {/* Detail modal */}
            <Modal
                isOpen={!!selected}
                onClose={() => setSelected(null)}
                size="md"
                title=""
            >
                {selected && (
                    <div className="w-[520px] max-w-full px-4 py-2 space-y-4">
                        <h2 className="text-xl font-bold text-table-header-text">
                            Detalle del mensaje #{selected.notification_id}
                        </h2>

                        {selected.image_url && (
                            <div className="rounded-lg overflow-hidden border border-table-divider">
                                <img
                                    src={selected.image_url}
                                    alt="Imagen del mensaje"
                                    className="w-full max-h-60 object-cover"
                                />
                            </div>
                        )}

                        <div>
                            <p className="text-xs text-text-muted mb-1">Título</p>
                            <p className="text-sm font-medium text-table-text">
                                {selected.title}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-text-muted mb-1">Mensaje</p>
                            <p className="text-sm text-table-text whitespace-pre-wrap">
                                {selected.message}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div>
                                <p className="text-xs text-text-muted">Filtro</p>
                                <p className="text-sm font-medium">
                                    {selected.filter_type === "all"
                                        ? "Todos los usuarios"
                                        : `${(selected.filter_countries || []).length} país(es)`}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-text-muted">Usuarios objetivo</p>
                                <p className="text-sm font-medium">
                                    {selected.sent_count || selected.target_count || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-text-muted">Estado</p>
                                <p className="text-sm font-medium">
                                    {selected.status === "failed" ? "Fallido" : selected.status === "no_tokens" ? "Sin tokens de dispositivo" : "Enviado"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-text-muted">Fecha</p>
                                <p className="text-sm font-medium">
                                    {new Date(selected.createdAt).toLocaleString("es-ES")}
                                </p>
                            </div>
                        </div>

                        {selected.filter_type === "countries" &&
                            (selected.filter_countries || []).length > 0 && (
                                <div>
                                    <p className="text-xs text-text-muted mb-2">Países</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(selected.filter_countries || []).map((c) => (
                                            <span
                                                key={c}
                                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-50 border border-table-divider"
                                            >
                                                <CountryFlagImg code={c} />
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                        <div className="flex justify-end pt-4 border-t border-table-divider">
                            <Button
                                onClick={() => setSelected(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                            >
                                Cerrar
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
