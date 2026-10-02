import { useProjectConfigStore } from '@/stores/useProjectConfigStore';
import { useEffect } from 'react';

export const useConfig = (key?: string) => {
  const { config, isLoading, error, fetchConfig, updateConfig } = useProjectConfigStore();

  // Fetch config if it hasn't been loaded yet
  useEffect(() => {
    if (Object.keys(config).length === 0 && !isLoading && !error) {
      fetchConfig();
    }
  }, [config, isLoading, error, fetchConfig]);

  // Get a specific config value or the entire config
  const getValue = (k: string) => config[k];
  
  // Update a config value
  const setValue = async (k: string, value: any) => {
    await updateConfig(k, value);
  };

  return {
    config: key ? getValue(key) : config,
    isLoading,
    error,
    setValue,
    getValue,
  };
};

// Helper hook for components that need the entire config
// export const useConfig = () => useProjectConfigStore();

// Helper hook for components that need a specific config value
export const useConfigValue = (key: string) => {
  const { config, isLoading, error, updateConfig } = useProjectConfigStore();
  
  return {
    value: config[key],
    isLoading,
    error,
    setValue: (value: any) => updateConfig(key, value),
  };
};
