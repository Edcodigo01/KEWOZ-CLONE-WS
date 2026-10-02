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
import {
  avatarService,
  type AvatarUploadParams,
  type AvatarUpdateParams,
  type Avatar,
} from "@/services/global/avatarService";
import { useModal } from "@/providers/ModalProvider";
import { useToast } from "@/components/ui/Toast";
import { Plus } from "lucide-react";
import { useDemoGuard } from "@/utils/demoGuard";

type AvatarFormData = {
  name: string;
  avatar_gender: "male" | "female" | "other";
  pictureType: "avatar" | "profile" | "custom";
  files: FileList | null;
};

type AvatarFormProps = {
  avatar?: Avatar;
  mode?: "create" | "edit";
  onUpdate?: (updatedAvatar: Avatar) => void;
};

export function AvatarForm({
  avatar,
  mode = "create",
  onUpdate,
}: AvatarFormProps) {
  const { close } = useModal();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { checkDemo } = useDemoGuard();

  const form = useForm<AvatarFormData>({
    defaultValues: {
      name: avatar?.name || "",
      avatar_gender:
        (avatar?.avatar_gender as "male" | "female" | "other") || "male",
      pictureType: "avatar",
      files: null,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (avatar && mode === "edit") {
      form.setValue("name", avatar.name);
      form.setValue("avatar_gender", avatar.avatar_gender as "male" | "female");
    }
  }, [avatar, mode, form]);

  const handleSubmit = async (data: AvatarFormData) => {
    if (checkDemo()) return;

    if (mode === "create" && (!data.files || data.files.length === 0)) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      let response;

      if (mode === "edit" && avatar) {
        const updateParams: AvatarUpdateParams = {
          avatar_id: avatar.avatar_id,
          name: data.name,
          avatar_gender: data.avatar_gender,
          pictureType: data.pictureType,
          files: data.files?.[0],
        };
        response = await avatarService.updateAvatar(updateParams);
      } else {
        const uploadParams: AvatarUploadParams = {
          name: data.name,
          avatar_gender: data.avatar_gender,
          pictureType: data.pictureType,
          files: data.files![0]!,
        };
        console.log("upload_Params" , uploadParams);
        
        response = await avatarService.uploadAvatar(uploadParams);
      }

      if (response.status) {
        toast({
          title: "Success!",
          description: `Avatar ${mode === "edit" ? "updated" : "uploaded"
            } successfully!`,
          variant: "success",
        });

        if (mode === "edit" && avatar && onUpdate) {
          const updatedAvatar: Avatar = {
            ...avatar,
            name: data.name,
            avatar_gender: data.avatar_gender,
            updatedAt: new Date().toISOString(),
          };
          onUpdate(updatedAvatar);
        } else {
          form.reset();
          setSelectedFile(null);
          close();
        }
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file || null);
      form.setValue("files", files);
    } else {
      setSelectedFile(null);
      form.setValue("files", null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4">
      <Form form={form} onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Avatar Upload Circle */}
        <FormItem>
          <FormLabel required>Avatar</FormLabel>
          <FormControl>
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-100 overflow-hidden">
                  {selectedFile ? (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : avatar?.avatar_media ? (
                    <img
                      src={avatar.avatar_media}
                      alt={avatar.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-4xl">👤</span>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-1 right-1 bg-secondary p-1 rounded-full cursor-pointer "
                >
                  <Plus className="w-4 h-4 text-text" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
              </div>
              <p className="mt-2 text-sm text-text-muted">
                {mode === "edit" ? "Change Avatar" : "Add Avatar"}
              </p>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>

        {/* Avatar Name */}
        <FormItem>
          <FormLabel required>Avatar Name</FormLabel>
          <FormControl>
            <FormField name="name">
              <input
                placeholder="Enter Avatar Name"
                disabled={isLoading}
                onChange={(e) => form.setValue("name", e.target.value)}
                className="flex h-10 sm:h-10 w-full sm:w-[30vw] max-w-full rounded-md border border-gray-300 px-3 py-2 mt-2 text-sm text-text-muted focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </FormField>
          </FormControl>
          <FormMessage />
        </FormItem>

        {/* Gender - Radio Buttons */}
        <FormItem>
          <FormLabel required>Gender</FormLabel>
          <FormControl>
            <FormField name="avatar_gender">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-2 text-text-muted">
                {["male", "female"].map((g) => (
                  <label
                    key={g}
                    className="flex items-center gap-2 cursor-pointer text-sm sm:text-base"
                  >
                    <input
                      type="radio"
                      value={g}
                      checked={form.watch("avatar_gender") === g}
                      onChange={() =>
                        form.setValue("avatar_gender", g as "male" | "female")
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
            disabled={isLoading || (mode === "create" && !selectedFile)}
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
