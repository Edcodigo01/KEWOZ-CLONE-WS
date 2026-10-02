import React, { useEffect, useState } from "react";
import { DataTable, type DataTableColumn, Button, Modal, Toggle, Spinner } from "@/components/ui";
import { languageService, type LanguageItem, type WordListWithTranslationResponseRecord } from "@/services/global/languageService";
import { Breadcrumb } from "@/layouts";
import { CircleArrowLeft, Edit, Languages, PencilLine } from "lucide-react";
import { EditLanguageForm } from "@/components/forms/EditLanguageForm";
import { useNavigate } from "react-router";
import { useParams } from "react-router";
import { useDemoGuard } from "@/utils/demoGuard";



export default function TranslatedWordListPage() {
    const { id } = useParams(); // 👈 language id from URL

    const navigate = useNavigate(); // 👈 for navigation

    const [rows, setRows] = useState<WordListWithTranslationResponseRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const { checkDemo } = useDemoGuard();


    const translate_current_word = async (key_id: number, key: string) => {
        const translated = await languageService.translateAWord(
            Number(id),
            key_id,
            key
        );

        if (translated.status && translated.data) {
            return (translated.data as { [key: number]: string })[key_id] || "";
        }
        return "";
    };
    const update_word_translation = async (key_id: number, newTranslation: string) => {
        try {
            await languageService.updateAWord(Number(id), key_id, newTranslation);
            setRows((prev) =>
                prev.map((row) =>
                    row.key_id === key_id
                        ? { ...row, Translation: newTranslation, edited: false }
                        : row
                )
            );

        } catch (err) {
            console.error("Failed to update translation", err);
        }
    };

    const columns: Array<DataTableColumn<WordListWithTranslationResponseRecord>> = [
        {
            header: "ID",
            cell: (r) => <span className="text-primary-600">#{r.key_id}</span>,
            className: "w-20",
        },
        {
            header: "Word",
            cell: (r) => (
                <div>
                    <div className="text-table-text text-sm font-medium">{r.key}</div>
                    {/* <div className="text-xs text-text-muted">{r.languageShort}</div> */}
                </div>
            ),
        },
        {
            header: "Translation",
            accessor: "Translation",
            cell: (r) => (
                <input
                    type="text"
                    value={r.Translation || ""}
                    onChange={(e) =>
                        setRows((prev) =>
                            prev.map((row) =>
                                row.key_id === r.key_id
                                    ? { ...row, Translation: e.target.value, dirty: true } // 👈 mark dirty when user edits
                                    : row
                            )
                        )
                    }
                    className="border  border-table-divider focus:ring-0 focus:border-table-divider rounded px-2 py-1 text-sm w-full"
                />
            ),
        },


        {
            header: "Actions",
            cell: (r) => (
                <div className="flex items-center gap-2">
                    {/* Translation Button */}
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => {


                            if (checkDemo()) return;

                            translate_current_word(r.key_id, r.key).then((translated) => {
                                setRows((prevRows) =>
                                    prevRows.map((row) =>
                                        row.key_id === r.key_id
                                            ? { ...row, Translation: translated, dirty: false }
                                            : row
                                    )
                                );
                            })
                        }
                        }
                        className="flex items-center gap-1 px-2 py-1 h-8 bg-[#4260ee] text-white"
                        title="Translate Word"
                    >
                        <Languages className="h-4 w-4 text-white" />
                        <span className="text-sm">Translate</span>
                    </Button>

                    {/* Update Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!r.dirty} // 👈 enabled only when changed

                        onClick={
                            async () => {
                                if (checkDemo()) return;

                                update_word_translation(r.key_id, r.Translation || "")
                                r.dirty = false; // reset dirty flag after update
                            }
                        }
                        className="flex items-center gap-1 px-2 py-1 h-8 bg-[#e6505a] text-white"
                        title="Translate Word"

                    >
                        <PencilLine className="h-4 w-4 text-white" />
                        <span className="text-sm">Update</span>
                    </Button>
                </div>
            ),
        },



    ];
    const handleTranslateAll = async () => {
        try {
            if (checkDemo()) return;

            setIsTranslating(true);
            const result = await languageService.translateAllWord(Number(id));

            if (result.status && result.data) {
                const updatedRows = rows.map((row) => ({
                    ...row,
                    Translation: result.data[row.key_id] || row.Translation,
                    dirty: false,
                }));

                setRows(updatedRows);
            }
        } catch (err) {
            console.error("Translation failed:", err);
        } finally {
            setIsTranslating(false); // close modal
        }
    };


    const fetchLanguagesWords = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await languageService.getWordListWithTranslation(id)

            console.log("API Response:", response); // Debug log
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
                    const mapped: WordListWithTranslationResponseRecord[] = records.map((lang: any) => ({
                        key_id: lang.key_id,
                        key: lang.key,
                        Translation: lang.Translation,
                    }));
                    setRows(mapped);
                } else {
                    setRows([]);
                }
            } else {
                console.log("Response structure:", response); // Debug log
                setError(response.message || "Failed to load languages");
            }
        } catch (e) {
            console.error("Failed to load languages:", e);
            setError("Failed to load languages");
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLanguagesWords();
    }, []);

    return (
        <div className="space-y-4">
            <div className="mt-2  flex justify-between">
                <Breadcrumb />
                <div className="flex gap-4">
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleTranslateAll}
                        className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white"
                    >
                        <Languages className="h-4 w-4 text-white" />
                        <span className="text-sm">Translate All</span>
                    </Button>
                    <Button
                        variant='default'
                        size="icon"
                        className='h-10 w-10 bg-primary-dark/20 hover:bg-primary-dark/20 rounded-full text-primary  '
                        onClick={() => navigate("/language/language-list")} // 👈 change route as needed
                    >
                        <CircleArrowLeft className="h-4 w-4" />
                        {/* <span className="text-sm">Back to Languages</span> */}
                    </Button>

                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <DataTable data={rows} columns={columns} defaultPageSize={10} />{/* Edit Avatar Modal */}
            <Modal
                isOpen={isTranslating}
                onClose={() => { }} // 👈 disable manual closing
                title="Translating Words"
                size="md"
                showCloseButton={false}
            >
                <div className="flex flex-col items-center gap-4 py-6">
                    <p className="text-center text-xl">
                        <strong>Translating</strong>.

                    </p>
                    <Spinner />
                    <p className="text-center text-lg">
                        Translating all words might take <strong>10–15 minutes</strong>.
                        Please keep this tab open until it finishes.
                    </p>
                </div>
            </Modal>
        </div>
    );
}
