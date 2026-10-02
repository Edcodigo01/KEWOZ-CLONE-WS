import React, { useState, useEffect } from "react";
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
  reportService,
  type ReportTypeParams,
} from "@/services/global/reportService";
import { useDemoGuard } from "@/utils/demoGuard";

type ReportTypeFormData = {
  report_for: "user" | "group";
  report_text: string;
};

type ReportTypeFormProps = {
  mode?: "create" | "edit";
};

export function AddReportType({ mode = "create" }: ReportTypeFormProps) {
  const { close } = useModal();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { checkDemo } = useDemoGuard();

  const form = useForm<ReportTypeFormData>({
    defaultValues: {
      report_for: "user",
      report_text: "",
    },
    mode: "onChange",
  });

  const reportText = form.watch("report_text");
  const disabled = !reportText?.trim(); // true if empty string
  useEffect(() => {
    if (mode === "edit") {
      form.setValue("report_for", form.getValues("report_for"));
      form.setValue("report_text", form.getValues("report_text"));
    }
  }, [mode, form]);

  const handleSubmit = async (data: ReportTypeFormData) => {
    setIsLoading(true);
    try {
      if (checkDemo()) return;
      let response;
      const uploadParams: ReportTypeParams = {
        report_for: data.report_for,
        report_text: data.report_text,
      };
      response = await reportService.addReportType(uploadParams);

      if (response.status) {
        toast({
          title: "Success!",
          description: `Report Type added successfully!`,
          variant: "success",
        });

        form.reset();
        close();
      } else {
        throw new Error(
          response.message ||
          `Failed to ${mode === "edit" ? "update" : "upload"} avatar`
        );
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${mode === "edit" ? "update" : "upload"
          } avatar. Please try again.`,
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4">
      <Form form={form} onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Report Type */}
        <FormItem>
          <FormLabel required>Report Text</FormLabel>
          <FormControl>
            <FormField name="report_text">
              <input
                placeholder="Enter Report Text"
                disabled={isLoading}
                onChange={(e) => form.setValue("report_text", e.target.value)}
                className="flex h-10 sm:h-10 w-full sm:w-[30vw] max-w-full rounded-md border border-table-divider px-3 py-2 mt-2 text-sm text-text-muted focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </FormField>
          </FormControl>
          <FormMessage />
        </FormItem>

        {/* Report For - Radio Buttons */}
        <FormItem>
          <FormLabel required>Report For</FormLabel>
          <FormControl>
            <FormField name="report_for">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-2 text-text-muted">
                {["user", "group"].map((g) => (
                  <label
                    key={g}
                    className="flex items-center gap-2 cursor-pointer text-sm sm:text-base"
                  >
                    <input
                      type="radio"
                      value={g}
                      checked={form.watch("report_for") === g}
                      onChange={() =>
                        form.setValue("report_for", g as "user" | "group")
                      }
                      className="w-4 h-4"
                    />
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </label>
                ))}
              </div>
            </FormField>
          </FormControl>
          <FormMessage />
        </FormItem>

        {/* Submit */}
        <div className="flex justify-center pt-2 sm:pt-2">
          <Button
            type="submit"
            disabled={disabled || isLoading}
            className="w-32 sm:w-40 bg-primary  text-button-text  font-semibold py-2 text-sm sm:text-base rounded-md transition-colors duration-200"
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