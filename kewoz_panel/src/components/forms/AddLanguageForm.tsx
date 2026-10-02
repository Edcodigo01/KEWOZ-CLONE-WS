import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
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
  language_alignment: "RTL" | "LTR";
  language: string;
  country: string; // will store serialized { code, label }
};

type LanguageFormProps = {
  mode?: "create" | "edit";
};

export function AddLanguage({ mode = "create" }: LanguageFormProps) {
  const { close } = useModal();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LanguageFormData>({
    defaultValues: {
      language_alignment: "LTR",
      language: "",
      country: "",
    },
    mode: "onChange",
  });
  const { checkDemo } = useDemoGuard();

  const language = form.watch("language");
  const disabled = !language?.trim();

  // react-select country list
  const options = useMemo(() => countryList().getData(), []);

  useEffect(() => {
    if (mode === "edit") {
      form.setValue("language_alignment", form.getValues("language_alignment"));
      form.setValue("language", form.getValues("language"));
      form.setValue("country", form.getValues("country"));
    }
  }, [mode, form]);

  const handleSubmit = async (data: LanguageFormData) => {
    setIsLoading(true);
    try {
      if (checkDemo()) return;

      const uploadParams: LanguageItem = {
        language_alignment: data.language_alignment,
        language: data.language,
        country: data.country,
      };

      const response = await languageService.addLanguage(uploadParams);

      if (response.status) {
        toast({
          title: "Success!",
          description: "Language added successfully!",
          variant: "success",
        });
        form.reset();
        close();
      } else {
        throw new Error(
          response.message ||
          `Failed to ${mode === "edit" ? "update" : "upload"} language`
        );
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add language. Please try again.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4">
      <Form form={form} onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Language Alignment */}
        <FormItem>
          <FormLabel required>Language Alignment</FormLabel>
          <FormControl>
            <FormField name="language_alignment">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-2 text-text-muted">
                {["RTL", "LTR"].map((g) => (
                  <label
                    key={g}
                    className="flex items-center gap-2 cursor-pointer text-sm sm:text-base"
                  >
                    <input
                      type="radio"
                      value={g}
                      checked={form.watch("language_alignment") === g}
                      onChange={() =>
                        form.setValue("language_alignment", g as "RTL" | "LTR")
                      }
                      className="w-4 h-4"
                    />
                    {g}
                  </label>
                ))}
              </div>
            </FormField>
          </FormControl>
          <FormMessage />
        </FormItem>

        {/* Language */}
        <FormItem>
          <FormLabel required>Language</FormLabel>
          <FormControl>
            <FormField name="language">
              <input
                placeholder="Enter Language"
                disabled={isLoading}
                onChange={(e) => form.setValue("language", e.target.value)}
                className="flex h-10 sm:h-10 w-full sm:w-[30vw] max-w-full rounded-md border border-table-divider px-3 py-2 mt-2 text-sm text-text-muted focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </FormField>
          </FormControl>
          <FormMessage />
        </FormItem>

        {/* Country Dropdown */}
        <FormItem>
          <FormLabel required>Country</FormLabel>
          <FormControl>
            <FormField name="country">
              <Select
                options={options}
                isSearchable
                value={
                  form.watch("country")
                    ? options.find(
                      (c) =>
                        c.value ===
                        (JSON.parse(form.watch("country"))?.code || "")
                    )
                    : null
                }
                onChange={(selected) => {
                  if (selected) {
                    const { value, label } = selected as {
                      value: string;
                      label: string;
                    };
                    form.setValue("country", JSON.stringify({ code: value, label }));
                  } else {
                    form.setValue("country", "");
                  }
                }}
                isDisabled={isLoading}
                classNamePrefix="rs"
                classNames={{
                  control: ({ isFocused }) =>
                    `flex items-center bg-secondary text-text-muted border border-table-divider w-full sm:w-[30vw] rounded-md px-2 py-1 shadow-sm min-h-[38px]
                    ${isFocused
                      ? "ring-1 ring-primary"
                      : "border-secondary ring-1 ring-text-muted"
                    }`,
                  option: ({ isFocused, isSelected }) =>
                    `px-3 py-2 cursor-pointer ${isSelected
                      ? "bg-primary text-white"
                      : isFocused
                        ? "bg-secondary text-primary"
                        : "text-text-muted"
                    }`,
                }}
                styles={{ control: () => ({}) }}
              />
            </FormField>
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
            {isLoading
              ? mode === "edit"
                ? "Updating..."
                : "Uploading..."
              : "Submit"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
