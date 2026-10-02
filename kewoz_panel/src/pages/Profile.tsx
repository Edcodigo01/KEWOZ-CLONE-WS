import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Save, Camera, Lock, LockIcon } from "lucide-react";
import {
  profileService,
  type ProfileData,
  type UpdatePasswordRequest,
  type UpdateProfileRequest,
} from "@/services/global/profileService";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Button, Spinner, useToast } from "@/components/ui";
import { useAuthStore } from "@/store/auth/authStore";
import { useAuth } from "@/providers/AuthProvider";
import { useDemoGuard } from "@/utils/demoGuard";

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authStore = useAuthStore();
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    first_name: "",
    last_name: "",
    email: "",
    country_code: "+1",
    mobile_num: "",
    date_of_birth: "",
    gender: "Male",
  });
  const { refreshUser } = useAuth();
  const { checkDemo } = useDemoGuard();

  const [passwordData, setPasswordData] = useState<UpdatePasswordRequest>({
    current_password: "",
    password: "",
    confirm_password: "",
  });
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

  // NEW: Tab state
  const [selectedTab, setSelectedTab] = useState<"profile" | "password">(
    "profile"
  );
  const { toast } = useToast();
  useEffect(() => {
    loadProfile();
  }, []);

  const handlePasswordSave = async () => {
    try {
      if (checkDemo()) return;

      console.log(passwordData);
      if (
        !passwordData.current_password ||
        !passwordData.password ||
        !passwordData.confirm_password ||
        passwordData.password !== passwordData.confirm_password
      ) {
        toast({
          title: "Error",
          description:
            "La contraseña y su confirmación son obligatorias y deben coincidir",
        });
        return;
      }

      const response = await profileService.updatePassword(passwordData);
      if (response.status) {
        toast({
          title: "Éxito",
          description: "Contraseña actualizada con éxito",
        });
        setPasswordData({
          current_password: "",
          password: "",
          confirm_password: "",
        });
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "error",
        });
      }
    } catch (err) {
      console.error("Password update error:", err);
      setError("Error al actualizar la contraseña");
    }
  };

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await profileService.getProfile();
      if (response.status == true) {
        setProfile(response.data);
        setFormData({
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          email: response.data.email,
          country_code: response.data.country_code || "+1",
          mobile_num: response.data.mobile_num,
          date_of_birth: response.data.date_of_birth,
          gender: response.data.gender,
        });
        setSelectedAvatar(null);
        setPreviewUrl(response.data?.profile_pic)
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "error",
        });
      }
    } catch (err) {
      setError("Error al cargar el perfil");
      console.error("Profile load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (checkDemo()) return;

      setIsSaving(true);
      setError(null);
      const updateData: UpdateProfileRequest = {
        ...formData,
        ...(selectedAvatar && { profile_pic: selectedAvatar }),
      };

      const response = await profileService.updateProfile(updateData);
      if (response.status) {
        refreshUser()
        setProfile(response.data);
        authStore.fetchUserProfile()
        toast({
          title: "¡Éxito!",
          description: `¡Perfil actualizado con éxito!`,
          variant: "success",
        });
        setSelectedAvatar(null);
      }
    } catch (err) {
      setError("Error al actualizar el perfil");
      console.error("Profile update error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof UpdateProfileRequest,
    value: string
  ) => {
    setFormData((prev: UpdateProfileRequest) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedAvatar(file)
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ErrorMessage message="Perfil no encontrado" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 px-4 sm:py-6 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-xl font-bold text-table-header-text">Mi Perfil</h1>
        </div>

        <div className="border border-table-divider rounded-sm">
          {/* Tab Navigation */}
          <div className="flex border-b border-table-divider rounded-sm">
            <button
              onClick={() => setSelectedTab("profile")}
              className={`h-10 sm:h-12 flex items-center justify-center px-3 sm:px-4 text-xs sm:text-sm font-medium flex-1 sm:flex-none ${selectedTab === "profile"
                ? "bg-primary-dark/20 text-primary-dark rounded-tl-xs"
                : "text-text-muted"
                }`}
            >
              Editar Perfil
            </button>

            <button
              onClick={() => setSelectedTab("password")}
              className={`h-10 sm:h-12 flex items-center justify-center px-3 sm:px-4 text-xs sm:text-sm font-medium flex-1 sm:flex-none ${selectedTab === "password"
                ? "bg-primary-dark/20 text-primary-dark"
                : "text-gray-500"
                }`}
            >
              Cambiar Contraseña
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-6 p-4">
              <ErrorMessage message={error} />
            </div>
          )}

          {selectedTab === "profile" && (
            <div className="max-w-5xl mx-auto p-4 sm:p-6 h-full">
              {/* Avatar + Profile Form */}
              <div className="flex flex-col items-center justify-center mb-6 sm:mb-8">
                <div className="relative mb-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden">
                    {profile.profile_pic ? (
                      <img
                        src={previewUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-10 h-10 sm:w-12 sm:h-12 text-text-muted" />
                      </div>
                    )}
                  </div>
                  <label className="absolute text-text -bottom-1 -right-1 w-8 h-8 sm:w-10 sm:h-10 d rounded-full flex items-center justify-center cursor-pointer bg-secondary transition-all duration-200 shadow-lg border-2 border-table-divider">
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5 " />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarSelect}
                      className="hidden"
                      disabled={isSaving}
                    />
                  </label>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-table-header-text mb-2 text-center">
                  {profile.full_name}
                </h2>
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Nombre
                  </label>
                  <div className="relative">
                    <User className="absolute text-text rounded-lg left-3 top-1/2 transform -translate-y-1/2 w-5 h-5    " />
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) =>
                        handleInputChange("first_name", e.target.value)
                      }
                      className="w-full pl-12 sm:pl-14 pr-4 py-3 sm:py-4 border border-table-divider rounded-2xl text-text-muted text-sm"
                      placeholder="Ingresa el nombre"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Apellido
                  </label>
                  <div className="relative">
                    <User className="absolute text-text rounded-lg left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 " />
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) =>
                        handleInputChange("last_name", e.target.value)
                      }
                      className="w-full pl-12 sm:pl-14 pr-4 py-3 sm:py-4 border border-table-divider rounded-2xl text-text-muted text-sm"
                      placeholder="Ingresa el apellido"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pt-2 sm:pt-5 mb-8 sm:mb-12">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute text-text rounded-lg left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 " />
                    <input
                      type="email"
                      value={isEditing ? formData.email : profile.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      disabled={!isEditing}
                      className="w-full pl-12 sm:pl-14 pr-4 py-3 sm:py-4 border border-table-divider rounded-2xl text-text-muted text-sm"
                      placeholder="ejemplo@correo.com"
                    />
                  </div>
                </div>
                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Número de teléfono
                  </label>
                  <div className="flex space-x-2 items-center">
                    <div className="relative flex-1">
                      <Phone className="absolute text-text rounded-lg left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 " />
                      <input
                        type="tel"
                        value={
                          isEditing ? formData.mobile_num : profile.mobile_num
                        }
                        onChange={(e) =>
                          handleInputChange("mobile_num", e.target.value)
                        }
                        disabled={!isEditing}
                        className="w-full pl-12 sm:pl-14 pr-4 py-3 sm:py-4 border border-table-divider rounded-2xl text-text-muted text-sm"
                        placeholder="Ingresa el número de teléfono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 sm:mt-12 mb-6 sm:mb-8 pt-4 sm:pt-6">
                <div className="flex justify-center">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-32 sm:w-40 bg-primary text-button-text  font-semibold py-2 rounded-md transition-colors duration-200"
                  >
                    {isSaving ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Guardando...
                      </>
                    ) : (
                      "Enviar"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {selectedTab === "password" && (
            <div className="max-w-5xl mx-auto p-4 sm:p-6 h-full">
              <div className="flex flex-col items-center mb-6 sm:mb-8 text-center content-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mx-auto">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-6 sm:mb-8">
                      {profile.profile_pic ? (
                        <img
                          src={profile.profile_pic}
                          alt="Perfil"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-10 h-10 sm:w-12 sm:h-12 text-text-muted" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-table-header-text mb-2 mt-2 text-center">
                  {profile.full_name}
                </h2>
              </div>
              {/* Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pt-2 sm:pt-5 mb-8 sm:mb-12">

                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Contraseña actual
                  </label>
                  <div className="relative">
                    <LockIcon className="absolute text-text rounded-lg left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 " />
                    <input
                      type="password"
                      className="w-full pl-12 sm:pl-14 pr-4 py-3 sm:py-4 border border-table-divider rounded-2xl text-text-muted text-sm"
                      placeholder="Ingresa la contraseña actual"
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          current_password: e.target.value,
                        })
                      }
                      value={passwordData.current_password}
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <LockIcon className="absolute text-text rounded-lg left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 " />

                    <input
                      type="password"
                      className="w-full pl-12 sm:pl-14 pr-4 py-3 sm:py-4 border border-table-divider rounded-2xl text-text-muted text-sm"
                      placeholder="Ingresa la nueva contraseña"
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          password: e.target.value,
                        })
                      }
                      value={passwordData.password}
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="col-span-1 lg:col-span-1 mt-0 lg:mt-12">
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <LockIcon className="absolute text-text rounded-lg left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 " />

                    <input
                      type="password"
                      className="w-full pl-12 sm:pl-14 pr-4 py-3 sm:py-4 border border-table-divider rounded-2xl text-text-muted text-sm"
                      placeholder="Confirma la nueva contraseña"
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirm_password: e.target.value,
                        })
                      }
                      value={passwordData.confirm_password}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center mt-8 sm:mt-12 mb-6 sm:mb-8 pt-4 sm:pt-6">
                <Button
                  variant="default"
                  className="w-32 sm:w-40 bg-primary text-button-text  font-semibold py-2 rounded-md transition-colors duration-200"
                  onClick={handlePasswordSave}
                >
                  Enviar
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};