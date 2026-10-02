"use client";

import React, { useEffect, useState } from "react";
import JoditEditor from "jodit-react";
import { configService } from "@/services/configService";
import { Breadcrumb } from "@/layouts";
import { Button, useToast } from "@/components/ui";
import { useDemoGuard } from "@/utils/demoGuard";

const CMSPage: React.FC = () => {
  const [termsContent, setTermsContent] = useState<string>("");
  const [privacyContent, setPrivacyContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const { checkDemo } = useDemoGuard();

  const handleSave = async () => {
    try {
      if (checkDemo()) return;

      setLoading(true);
      const response = await configService.updateConfig({
        privacy_policy: privacyContent,
        terms_and_conditions: termsContent,
      });
      if (response.status) {
         toast({
          title: "Success",
          description: "CMS content updated successfully!",
        });
      } else {
toast({
          title: "Error",
          description: response.message,
          variant: "error",
        });      }
    } catch (error) {
      console.error(error);
toast({
          title: "Error",
          description: 'Something went wrong, try again.',
          variant: "error",
        });    } finally {
      setLoading(false);
    }
  };

  // Fetch CMS content
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await configService.getConfig();
        if (response.status) {
          setTermsContent(response.data.terms_and_conditions || "");
          setPrivacyContent(response.data.privacy_policy || "");
        }
      } catch (error) {
        console.error(error);
toast({
          title: "Error",
          description: 'Something went wrong, try again.',
          variant: "error",
        });      }
    };
    fetchPages();
  }, []);

  return (
    <div className="max-w-9xl mx-auto p-6">
      <Breadcrumb />

      <h1 className="my-5 font-bold text-text">Terms and Conditions</h1>
      <div className="max-h-[500px] overflow-y-scroll  rounded-lg">
        <JoditEditor
          value={termsContent}
          onBlur={(newContent) => setTermsContent(newContent)}
          config={{
            readonly: false,
            height: 400,
            iframe: true, // ensures styles apply inside editor body
            iframeCSS: `
      body {
        @apply bg-secondary text-table-header-text;
        font-size: 14px;
        padding: 12px;
        border-radius: 8px;
      }
    `,
          }}
        />
      </div>
      <Button
        variant="default"
        onClick={handleSave}
        disabled={loading}
        className="w-40 bg-primary mt-5 text-button-text  font-semibold py-2 rounded-md transition-colors duration-200"

      >
        {loading ? "Saving..." : "Submit"}
      </Button>

      <h1 className="my-5 font-bold text-text">Privacy Policy</h1>
      <div className="max-h-[500px] overflow-y-scroll rounded-lg">
        <JoditEditor
          value={privacyContent}
          onBlur={(newContent) => setPrivacyContent(newContent)}
          config={{
            readonly: false,
            height: 400,
            iframe: true, // ensures styles apply inside editor body
            iframeCSS: `
      body {
        @apply bg-secondary text-table-header-text;
        font-size: 14px;
        padding: 12px;
        border-radius: 8px;
      }
    `,}}
        />
      </div>
      <Button
        variant="default"
        onClick={handleSave}
        disabled={loading}
        className="w-40 bg-primary mt-5 text-button-text  font-semibold py-2 rounded-md transition-colors duration-200"

      >
        {loading ? "Saving..." : "Submit"}
      </Button>
    </div>
  );
};

export default CMSPage;
