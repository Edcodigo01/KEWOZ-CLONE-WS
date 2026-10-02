import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import countryList from "react-select-country-list";
import { X, Upload, Loader, Send, Image as ImageIcon, Users } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { Breadcrumb } from "@/layouts";
import { useToast } from "@/components/ui/Toast";
import { useDemoGuard } from "@/utils/demoGuard";
import {
    notificationService,
    type MassMessageSendParams,
} from "@/services/global/notificationService";
import { ROUTES } from "@/config/routes";

type CountryOption = {
    value: string; // ISO
    label: string;
};

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

export default function MassMessageSend() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { checkDemo } = useDemoGuard();

    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [filterType, setFilterType] = useState<"all" | "countries">("all");
    const [selectedCountries, setSelectedCountries] = useState<CountryOption[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [previewData, setPreviewData] = useState<{ total: number; withToken: number } | null>(null);
    const [loadingCount, setLoadingCount] = useState(false);
    const [sending, setSending] = useState(false);

    const countryOptions = useMemo<CountryOption[]>(() => {
        return countryList()
            .getData()
            .map((c) => ({ value: c.value, label: c.label }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, []);

    // ── Image handlers ────────────────────────────────────────────────────────
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast({
                title: "Archivo inválido",
                description: "Por favor selecciona un archivo de imagen.",
                variant: "error",
            });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "Imagen muy grande",
                description: "La imagen no puede superar los 5MB.",
                variant: "error",
            });
            return;
        }
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    // ── Preview count with debounce ───────────────────────────────────────────
    useEffect(() => {
        if (filterType === "countries" && selectedCountries.length === 0) {
            setPreviewData(null);
            return;
        }

        setLoadingCount(true);
        const timer = setTimeout(async () => {
            try {
                const res = await notificationService.previewMassMessageCount({
                    filter_type: filterType,
                    countries: selectedCountries.map((c) => c.value),
                });
                if (res.status) {
                    setPreviewData({ total: res.data.total, withToken: res.data.withToken });
                } else {
                    setPreviewData(null);
                }
            } catch (err) {
                console.error("Error fetching preview count:", err);
                setPreviewData(null);
            } finally {
                setLoadingCount(false);
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [filterType, selectedCountries]);

    // ── Form validation ───────────────────────────────────────────────────────
    const isValid =
        title.trim().length > 0 &&
        message.trim().length > 0 &&
        (filterType === "all" || selectedCountries.length > 0) &&
        previewData !== null &&
        previewData.total > 0;

    // ── Submit handler ────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (checkDemo()) return;
        if (!isValid || sending) return;

        setSending(true);
        try {
            const params: MassMessageSendParams = {
                title: title.trim(),
                message: message.trim(),
                image: imageFile,
                filter_type: filterType,
                countries:
                    filterType === "countries"
                        ? selectedCountries.map((c) => c.value)
                        : undefined,
            };

            const res = await notificationService.sendMassMessage(params);
            if (res.status) {
                toast({
                    title: "Mensaje enviado",
                    description: `Enviado a ${res.data.sent_count} usuarios`,
                    variant: "success",
                });
                navigate(ROUTES.MASS_MESSAGES.LIST);
            } else {
                throw new Error(res.message || "Error al enviar el mensaje");
            }
        } catch (err: any) {
            console.error("Error sending mass message:", err);
            toast({
                title: "Error",
                description:
                    err?.response?.data?.message ||
                    err?.message ||
                    "No se pudo enviar el mensaje masivo",
                variant: "error",
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-semibold text-table-header-text">
                Enviar Mensaje Masivo
            </h1>
            <Breadcrumb />

            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-lg border border-table-divider p-6 max-w-3xl space-y-6"
            >
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">
                        Título <span className="text-red-500">*</span>
                    </label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ej: ¡Nueva actualización disponible!"
                        maxLength={100}
                        className="w-full border border-table-divider"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        {title.length}/100 caracteres
                    </p>
                </div>

                {/* Message */}
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">
                        Mensaje <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Escribe el contenido del mensaje..."
                        rows={5}
                        maxLength={500}
                        className="flex w-full rounded-md border border-table-divider px-3 py-2 text-sm text-text-muted resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        {message.length}/500 caracteres
                    </p>
                </div>

                {/* Image (optional) */}
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">
                        Imagen (opcional)
                    </label>
                    {!imagePreview ? (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-table-divider rounded-lg cursor-pointer hover:bg-gray-50 transition">
                            <Upload className="h-6 w-6 text-gray-400 mb-1" />
                            <span className="text-sm text-text-muted">
                                Haz clic para subir una imagen
                            </span>
                            <span className="text-xs text-gray-400 mt-1">
                                PNG, JPG hasta 5MB
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>
                    ) : (
                        <div className="relative w-full max-w-xs border border-table-divider rounded-lg overflow-hidden">
                            <img
                                src={imagePreview}
                                alt="Vista previa"
                                className="w-full h-32 object-cover"
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                <ImageIcon className="h-3 w-3" />
                                {imageFile?.name}
                            </div>
                        </div>
                    )}
                </div>

                {/* Filter type */}
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                        Destinatarios <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3 mb-3">
                        <button
                            type="button"
                            onClick={() => {
                                setFilterType("all");
                                setSelectedCountries([]);
                            }}
                            className={`flex-1 px-4 py-2 rounded-md border text-sm font-medium transition ${
                                filterType === "all"
                                    ? "bg-primary text-button-text border-primary"
                                    : "bg-white text-text-muted border-table-divider hover:bg-gray-50"
                            }`}
                        >
                            <Users className="inline h-4 w-4 mr-2" />
                            Todos los usuarios
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterType("countries")}
                            className={`flex-1 px-4 py-2 rounded-md border text-sm font-medium transition ${
                                filterType === "countries"
                                    ? "bg-primary text-button-text border-primary"
                                    : "bg-white text-text-muted border-table-divider hover:bg-gray-50"
                            }`}
                        >
                            Por país
                        </button>
                    </div>

                    {filterType === "countries" && (
                        <div>
                            <Select
                                isMulti
                                options={countryOptions}
                                value={selectedCountries}
                                onChange={(opts) => setSelectedCountries(opts as CountryOption[])}
                                placeholder="Selecciona uno o más países..."
                                className="text-sm"
                                formatOptionLabel={(option: any) => (
                                    <div className="flex items-center gap-2">
                                        <CountryFlagImg code={option.value} />
                                        <span>{option.label}</span>
                                    </div>
                                )}
                                styles={{
                                    control: (base, state) => ({
                                        ...base,
                                        borderRadius: "0.5rem",
                                        minHeight: "42px",
                                        boxShadow: state.isFocused
                                            ? "0 0 0 1px #4361ee"
                                            : "none",
                                        borderColor: state.isFocused ? "#4361ee" : "#e2e8f0",
                                    }),
                                    menu: (base) => ({ ...base, zIndex: 9999 }),
                                }}
                            />
                            {selectedCountries.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {selectedCountries.length} país(es) seleccionado(s)
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Preview count */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">
                                Usuarios que recibirán el mensaje:
                            </span>
                        </div>
                        <div className="text-2xl font-bold text-blue-700">
                            {loadingCount ? (
                                <Loader className="h-5 w-5 animate-spin text-blue-600" />
                            ) : previewData !== null ? (
                                previewData.withToken
                            ) : (
                                "—"
                            )}
                        </div>
                    </div>
                    {previewData !== null && previewData.total > 0 && (
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-blue-600">
                                Total usuarios en el filtro: <strong>{previewData.total}</strong>
                            </span>
                            {previewData.withToken > 0 && (
                                <span className="text-green-600">
                                    Con token de dispositivo: <strong>{previewData.withToken}</strong>
                                </span>
                            )}
                        </div>
                    )}
                    {filterType === "countries" && selectedCountries.length === 0 && (
                        <p className="text-xs text-blue-600">
                            Selecciona al menos un país para ver el conteo
                        </p>
                    )}
                    {previewData !== null && previewData.total > 0 && previewData.withToken === 0 && !loadingCount && (
                        <p className="text-xs text-orange-600">
                            Hay {previewData.total} usuario(s) pero ninguno tiene token de dispositivo. Las notificaciones push se enviarán cuando los usuarios abran la app.
                        </p>
                    )}
                    {previewData !== null && previewData.total === 0 && !loadingCount && (
                        <p className="text-xs text-red-600">
                            No se encontraron usuarios para los filtros seleccionados
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-table-divider">
                    <Button
                        type="button"
                        onClick={() => navigate(ROUTES.MASS_MESSAGES.LIST)}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={!isValid || sending}
                        className="px-4 py-2 text-sm font-semibold text-button-text bg-primary rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {sending ? (
                            <>
                                <Loader className="h-4 w-4 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Enviar Mensaje
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
