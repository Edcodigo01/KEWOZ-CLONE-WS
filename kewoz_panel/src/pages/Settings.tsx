import React, { useState, useEffect } from 'react';
import { SettingsSidebar } from '../components/settings/SettingsSidebar';
import { GeneralSettings } from '../components/settings/GeneralSettings';
import { SMSSettings } from '../components/settings/SMSSettings';
import { PushNotificationSettings } from '../components/settings/PushNotificationSettings';
import { SplashSettings } from '../components/settings/SplashSettings';
import { configService } from '../services/configService';
import type { ConfigData } from '../services/configService';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Breadcrumb } from '@/layouts';
import { useProjectConfigStore } from '@/stores/useProjectConfigStore';
import { useDemoGuard } from '@/utils/demoGuard';

export const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [configData, setConfigData] = useState<ConfigData | null>(null);
  const [initialConfigData, setInitialConfigData] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { fetchConfig } = useProjectConfigStore()
  const { checkDemo } = useDemoGuard();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await configService.getConfig();
      setConfigData(response.data);
      if (!initialConfigData) {
        setInitialConfigData(JSON.parse(JSON.stringify(response.data)));
      }
      setError(null);
    } catch (err) {
      setError('Error al cargar la configuración');
      console.error('Error loading config:', err);
    } finally {
      setLoading(false);
    }
  };

  type FileField = 'app_logo_light' | 'app_logo_dark' | 'web_logo_light' | 'web_logo_dark' | 'email_banner' | 'splash_image' | 'splash_image_mobile';

  const isFileField = (field: string): field is FileField => {
    return ['app_logo_light', 'app_logo_dark', 'web_logo_light', 'web_logo_dark', 'email_banner', 'splash_image', 'splash_image_mobile'].includes(field);
  };

  const isFile = (value: unknown): value is File => {
    return value instanceof File;
  };

  const handleFileChange = (field: keyof ConfigData, event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);

    if (configData) {
      setConfigData({
        ...configData,
        [field]: fileUrl
      });
    }

    event.target.value = '';
  };

  const handleFileRemove = (field: keyof ConfigData) => {
    if (configData) {
      setConfigData({
        ...configData,
        [field]: ''
      });
    }
  };

  // const handleFieldChange = <K extends keyof ConfigData>(
  //   field: K,
  //   value: ConfigData[K]
  // ) => {
  //   console.log(configData?.is_msg91_enabled);
  //   console.log(configData?.is_twilio_enabled);
    
  //   if (configData) {
  //     setConfigData({
  //       ...configData,
  //       [field]: value
  //     });
  //   }
  // };
const handleFieldChange = <K extends keyof ConfigData>(
    field: K,
    value: ConfigData[K]
  ) => {
    setConfigData((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleMultiFieldChange = (updates: Partial<ConfigData>) => {
    setConfigData((prev) => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
  };
 
  const handleSave = async () => {
    if (!configData || !initialConfigData) return;
    if (checkDemo()) return;
    if(activeSection === "purchase"){
      await configService.deactivate();
      window.location.reload()
      return
    }
    try {
      setSaving(true);
      const dataToSend: Partial<ConfigData> = {};

      (Object.keys(configData) as Array<keyof ConfigData>).forEach((key) => {
        const currentValue = configData[key];
        const initialValue = initialConfigData[key];

        if (JSON.stringify(currentValue) !== JSON.stringify(initialValue)) {
          // @ts-ignore
          dataToSend[key] = currentValue;
        }
      });

      if (Object.keys(dataToSend).length === 0) {
        return;
      }

      const hasFileUploads = Object.entries(dataToSend).some(([key, value]) => {
        if (!isFileField(key)) return false;
        const currentValue = value;
        const initialValue = initialConfigData?.[key];
        return (
          isFile(currentValue) ||
          (typeof currentValue === 'string' &&
            (currentValue.startsWith('blob:') ||
              currentValue !== initialValue))
        );
      });

      if (hasFileUploads) {
        const formData = new FormData();

        for (const [key, value] of Object.entries(dataToSend)) {
          if (!isFileField(key)) continue;
          const currentValue = value;
          const initialValue = initialConfigData?.[key];
          if (currentValue === undefined) continue;

          if (isFile(currentValue)) {
            formData.append(key, currentValue);
            delete dataToSend[key];
          } else if (typeof currentValue === 'string' && currentValue.startsWith('blob:')) {
            try {
              const response = await fetch(currentValue);
              const blob = await response.blob();
              const file = new File(
                [blob],
                `${key}-${Date.now()}.${blob.type.split('/')[1] || 'png'}`,
                { type: blob.type }
              );
              formData.append(key, file);
              delete dataToSend[key];
            } catch (error) {
              console.error(`Error processing file ${key}:`, error);
              delete dataToSend[key];
            }
          } else if (typeof currentValue === 'string' && currentValue !== initialValue) {
            formData.append(key, currentValue);
            delete dataToSend[key];
          }
        }

        Object.entries(dataToSend).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });

        await configService.updateConfig(formData as any);
        fetchConfig()
      } else if (Object.keys(dataToSend).length > 0) {

        await configService.updateConfig(dataToSend);
        fetchConfig()
      } else {
        return;
      }

      await loadConfig();
      console.log('Configuration saved successfully');
    } catch (error) {
      console.error('Error saving configuration:', error);
      setError('Error al guardar la configuración');
      throw error;
    } finally {
      // setSaving(false);
      window.location.reload()
    }
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const renderContent = () => {
    if (!configData) return null;

    switch (activeSection) {
      case 'general':
        return (
          <GeneralSettings
            data={configData}
            onChange={handleFieldChange}
            onFileChange={handleFileChange}
            onFileRemove={handleFileRemove}
          />
        );
      case 'sms':
        return (
          <SMSSettings
            data={configData}
            onChange={handleFieldChange}
            onMultiChange={handleMultiFieldChange}
 
          />
        );
      case 'push':
        return (
          <PushNotificationSettings
            data={configData}
            onChange={handleFieldChange}
          />
        );
      case 'purchase':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-table-header-text">Código de Compra</h3>
            <p className="text-text-muted">
              Configuración de tu código de compra:
            </p>

            <div className="border border-gray-200 rounded-md p-4">
              <p className="text-sm font-mono text-text-muted break-all">
                {configData?.masked_purchase_code || "No se encontró código de compra."}
              </p>
            </div>
          </div>
        );
      case 'banner':
        return (
          <SplashSettings
            data={configData}
            onChange={handleFieldChange}
            onFileChange={handleFileChange}
            onFileRemove={handleFileRemove}
          />
        );
      default:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-text-dark">Configuración</h3>
            <p className="text-text-muted">Selecciona una sección del menú lateral para configurar los ajustes.</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary rounded-4xl">
      {/* Header */}
      <div className="px-2 sm:px-4 lg:px-6 my-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold text-table-header-text mb-3">
              Configuración
            </div>
            <Breadcrumb />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-md border border-table-divider bg-white shadow-sm"
            aria-label="Alternar menú lateral"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {sidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="relative">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 border border-table-divider mt-4 rounded-lg mx-2 sm:mx-4 lg:mx-6 p-2 sm:p-4">

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className={`
            lg:relative lg:translate-x-0 lg:w-64 xl:w-96
            ${sidebarOpen
              ? 'fixed inset-y-0 left-0 z-50 w-64 transform translate-x-0'
              : 'fixed inset-y-0 left-0 z-50 w-64 transform -translate-x-full lg:translate-x-0'
            }
            transition-transform duration-300 ease-in-out
            bg-white lg:bg-transparent
            border-r lg:border-r-0 border-table-divider
            overflow-y-auto
            lg:overflow-visible
          `}>
            <div className="p-4 lg:p-0">
              {/* Close button for mobile */}
              <div className="lg:hidden flex justify-end mb-4">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="rounded-lg lg:rounded-[30px] overflow-hidden">
                <SettingsSidebar
                  activeSection={activeSection}
                  onSectionChange={handleSectionChange}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 w-full">
            <div className="h-full">
              <div className="bg-secondary rounded-lg p-3 sm:p-4 lg:p-6">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="overflow-x-auto">
                  {renderContent()}
                </div>

                {/* Save Button */}
                <div className="mt-8 pt-6">
                  <div className="flex justify-center">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full sm:w-40 bg-primary text-button-text font-semibold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                    >
                      {saving ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          {activeSection === "purchase" ? "Desactivando..." : "Guardando..."}
                        </>
                      ) : (
                        activeSection === "purchase" ? "Desactivar" : "Guardar Cambios"
                      )}
                    </Button>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};