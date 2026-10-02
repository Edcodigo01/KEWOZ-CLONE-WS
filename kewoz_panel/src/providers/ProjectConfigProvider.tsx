import type { ReactNode } from 'react';
import { createContext, useContext, useEffect } from 'react';
import { useProjectConfigStore } from '@/stores/useProjectConfigStore';
import { setThemeColors } from '@/utils/theme';

type ConfigValue = string | number | boolean | Record<string, unknown> | null;

type ProjectConfigContextType = {
  config: Record<string, any> | null;
  isLoading: boolean;
  error: string | null;
  updateConfig: (key: string, value: ConfigValue) => Promise<void>;
  getConfigValue: <T extends ConfigValue>(key: string, defaultValue?: T) => T | undefined;
};

const ProjectConfigContext = createContext<ProjectConfigContextType | undefined>(undefined);

export const ProjectConfigProvider = ({ children }: { children: ReactNode }) => {
  const { config, isLoading, error, updateConfig } = useProjectConfigStore();

  const getConfigValue = <T extends ConfigValue>(
    key: string,
    defaultValue?: T
  ): T | undefined => {
    if (!config) return defaultValue;
    
    // Check in config.data first (most config values are here)
    if (config.data && key in config.data) {
      return (config.data as Record<string, any>)[key] as T;
    }
    
    // Then check root level properties
    if (key in config) {
      return (config as Record<string, any>)[key] as T;
    }
    
    return defaultValue;
  };
  useEffect(() => {
    if (!config) return;
    console.log("config" , config);
    
    const primary =
      getConfigValue<string>("app_primary_color") ||
      // getConfigValue<string>("primary") ||
      "#fdc604"; // fallback to your default

    const secondary =
      getConfigValue<string>("app_secondary_color") ||
      // getConfigValue<string>("secondary") ||
      "#ffffff"; // fallback

    setThemeColors(primary, secondary);
  }, [config]);

  return (
    <ProjectConfigContext.Provider
      value={{
        config,
        isLoading,
        error,
        updateConfig,
        getConfigValue,
      }}
    >
      {children}
    </ProjectConfigContext.Provider>
  );
};

export const useProjectConfig = (): ProjectConfigContextType => {
  const context = useContext(ProjectConfigContext);
  if (context === undefined) {
    throw new Error('useProjectConfig must be used within a ProjectConfigProvider');
  }
  return context;
};
