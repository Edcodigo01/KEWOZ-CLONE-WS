import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/Form";
import { useModal } from "@/providers/ModalProvider";
import { useToast } from "@/components/ui/Toast";
import {
  languageService,
  type LanguageItem,
} from "@/services/global/languageService";
import Select from "react-select";
import countryList from "react-select-country-list";
import { useDemoGuard } from "@/utils/demoGuard";

type LanguageFormData = {
  language_alignment: "LTR" | "RTL";
  language: string;
  country: string; // we'll store the plain string value here
};

type EditLanguageFormProps = {
  mode?: "create" | "edit";
  language?: Partial<LanguageItem>;
  onUpdate?: (updated: LanguageItem) => void;
};

export function EditLanguageForm({
  mode = "edit",
  language,
  onUpdate,
}: EditLanguageFormProps) {
  const { close } = useModal();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { checkDemo } = useDemoGuard();

  const options = useMemo(() => countryList().getData(), []);

  const form = useForm<LanguageFormData>({
    defaultValues: {
      language_alignment: (language?.language_alignment as "LTR" | "RTL") || "LTR",
      language: language?.language || "",
      country: "", // we'll set the correct country in useEffect (mapped to option value)
    },
    mode: "onChange",
  });

  const disabled = !form.watch("language")?.trim();

  // Helper: try many ways to interpret the stored value and return the matching option object
  const getOptionByPossibleValue = (val: any) => {
    if (!val && val !== "") return null;

    // 1) If it's already an option-like object with value & label
    if (typeof val === "object" && val !== null && "value" in val && "label" in val) {
      return options.find((o) => String(o.value) === String((val as any).value)) || null;
    }

    // 2) If it's a JSON string like '{"code":"US","label":"United States"}'
    if (typeof val === "string") {
      const trimmed = val.trim();

      // JSON attempt
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && (parsed.code || parsed.value || parsed.label)) {
            const code = parsed.code || parsed.value || parsed.label;
            // match by code
            return options.find((o) => String(o.value).toLowerCase() === String(code).toLowerCase()) || null;
          }
        } catch (e) {
          // not JSON — continue
        }
      }

      // 3) Exact value match (case-insensitive)
      const exact = options.find((o) => String(o.value).toLowerCase() === trimmed.toLowerCase());
      if (exact) return exact;

      // 4) Try match by label (case-insensitive, includes)
      const byLabel = options.find((o) => String(o.label).toLowerCase().includes(trimmed.toLowerCase()));
      if (byLabel) return byLabel;

      // 5) Try common reductions: if val is "USA" try match with "US" or vice-versa.
      // Try 2-letter prefix match
      if (trimmed.length === 3) {
        const two = trimmed.slice(0, 2);
        const twoMatch = options.find((o) => String(o.value).toLowerCase() === two.toLowerCase());
        if (twoMatch) return twoMatch;
      }

      // last resort: no match
      return null;
    }

    return null;
  };

  // When language prop changes, reset form and map country to correct option.value if possible
  useEffect(() => {
    if (mode === "edit" && language) {
      const rawCountry = (language as any).country; // might be "USA", JSON, or empty
      const matched = getOptionByPossibleValue(rawCountry);
      const countryValue = matched ? String(matched.value) : (typeof rawCountry === "string" ? rawCountry : "");

      form.reset({
        language_alignment: (language.language_alignment as "LTR" | "RTL") || "LTR",
        language: language.language || "",
        country: countryValue,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, language, options]); // include options so mapping works after options are ready

  const handleSubmit = async (data: LanguageFormData) => {
    if (checkDemo()) return;

    console.log("Form submitted with data:", data);
    setIsLoading(true);

    try {
      // data.country will be the plain string we stored (option.value or original string)
      // If you need to send a specific format to backend (alpha2/alpha3), convert here.
      // For safety, try to map to option object and get its .value (otherwise use raw string)
      const matched = getOptionByPossibleValue(data.country);
      const countryCodeToSend = matched ? String(matched.value) : data.country || "";

      let response;
      if (mode === "edit" && language?.language_id) {
        const updateData = {
          language_alignment: data.language_alignment,
          language: data.language,
          country: countryCodeToSend,
          status: (language as any).status,
          default_status: (language as any).default_status,
        };
        console.log("Updating language with:", updateData);
        response = await languageService.editLanguage((language as any).language_id, updateData);

        if (response?.status && onUpdate) {
          onUpdate({
            ...(language as any),
            ...updateData,
            language_id: (language as any).language_id,
          } as LanguageItem);
        }
      } else {
        const newLanguage = {
          language_alignment: data.language_alignment,
          language: data.language,
          country: countryCodeToSend,
          status: true,
          default_status: false,
        };
        console.log("Adding new language:", newLanguage);
        response = await languageService.addLanguage(newLanguage);
      }

      if (response?.status) {
        toast({
          title: "Success!",
          description: `Language ${mode === "edit" ? "updated" : "added"} successfully!`,
          variant: "success",
        });

        // If backend returns the updated row and you want to update parent
        if (mode === "edit" && onUpdate) {
          // prefer response row if present, otherwise we already invoked onUpdate above
          if (response.data?.row?.[0]) {
            onUpdate({ ...response.data.row[0], language_id: (language as any)?.language_id });
          }
        }

        form.reset();
        close();
      } else {
        throw new Error(response?.message || `Failed to ${mode === "edit" ? "update" : "upload"} language`);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: `Failed to ${mode === "edit" ? "update" : "upload"} language. Please try again.`,
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4">
      <Form form={form} onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Language */}
        <FormField name="language">
          <div className="relative">
            <input
              placeholder="Enter Language"
              // disable when editing or when loading
              disabled={isLoading || mode === "edit"}
              // native tooltip shown on hover
              title={mode === "edit" ? "Language name cannot be changed" : ""}
              value={form.watch("language")}
              onChange={(e) => form.setValue("language", e.target.value)}
              className={`flex h-10 w-full sm:w-[30vw] max-w-full rounded-md border px-3 py-2 mt-2 text-sm
            ${isLoading || mode === "edit" ? "bg-gray-50 text-text-muted cursor-not-allowed border-table-divider" : "border-table-divider focus:border-blue-500 focus:ring-2 focus:ring-blue-200"}
            outline-none`}
            />
            {/* small info icon on the right with same tooltip */}
            {mode === "edit" && (
              <span
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm select-none"
                title="Language name cannot be changed"
                aria-hidden
              >
                Language name cannot be changed
              </span>
            )}
          </div>
        </FormField>

        {/* Language Alignment */}
        <FormItem>
          <FormLabel required>Language Alignment</FormLabel>
          <FormControl>
            <FormField name="language_alignment">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-2 text-text-muted">
                {["LTR", "RTL"].map((align) => (
                  <label key={align} className="flex items-center gap-2 cursor-pointer text-sm sm:text-base">
                    <input
                      type="radio"
                      value={align}
                      checked={form.watch("language_alignment") === align}
                      onChange={() => form.setValue("language_alignment", align as "LTR" | "RTL")}
                      className="w-4 h-4"
                    />
                    {align}
                  </label>
                ))}
              </div>
            </FormField>
          </FormControl>
          <FormMessage />
        </FormItem>

        {/* Country */}
        <FormItem>
          <FormLabel required>Country</FormLabel>
          <FormControl>
            <Controller
              name="country"
              control={form.control}
              render={({ field }) => {
                // Map stored string to the object from options (so Select shows the object)
                const currentOption = getOptionByPossibleValue(field.value);

                return (
                  <Select
                    options={options}
                    isSearchable
                    value={currentOption}
                    onChange={(selected) => {
                      if (selected) {
                        field.onChange(String((selected as any).value)); // store plain string value
                      } else {
                        field.onChange("");
                      }
                    }}
                    isDisabled={isLoading}
                    classNamePrefix="rs"
                    classNames={{
                      control: ({ isFocused }) =>
                        `flex items-center bg-secondary text-text-muted border border-table-divider w-full rounded-md px-2 py-1 shadow-sm min-h-[38px] ${isFocused ? "ring-1 ring-primary" : "border-secondary ring-1 ring-text-muted"
                        }`,
                      option: ({ isFocused, isSelected }) =>
                        `px-3 py-2 cursor-pointer ${isSelected ? "bg-primary text-white" : isFocused ? "bg-secondary text-primary" : "text-text-muted"
                        }`,
                    }}
                  />
                );
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        {/* Submit */}
        <div className="flex justify-center pt-2 sm:pt-2">
          <Button
            type="submit"
            disabled={disabled || isLoading}
            className="w-32 sm:w-40 bg-primary text-button-text  font-semibold py-2 text-sm sm:text-base rounded-md transition-colors duration-200"
          >
            {isLoading ? (mode === "edit" ? "Updating..." : "Uploading...") : "Submit"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
