import { create } from 'zustand';
import type { StoreApi, StateCreator } from 'zustand';
import { toast } from 'sonner';
import { projectService } from '@/services/global/projectConfigurationService';
import type { ProjectConfiguration } from '@/types/project_configuration';
import { devtools, persist } from 'zustand/middleware';

type ConfigValue = string | number | boolean | Record<string, unknown> | null;

interface ProjectConfigState {
  config: ProjectConfiguration['data'] | null;
  isLoading: boolean;
  error: string | null;
  fetchConfig: () => Promise<void>;
  updateConfig: (key: string, value: ConfigValue) => Promise<void>;
}

type Store = ProjectConfigState;

const store: StateCreator<Store> = (set) => ({
  config: null,
  isLoading: false,
  error: null,
  
  fetchConfig: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectService.getProjectConfig();
      console.log('Fetched project configuration:', response);
      
      if (!response.data) {
        throw new Error('No configuration data found in response');
      }
      
      set({ 
        config: response.data, 
        isLoading: false 
      });
      console.log('Project configuration loaded:', response.data);
      
    } catch (error) {
      console.error('Failed to fetch config:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load configuration', 
        isLoading: false 
      });
      toast.error('Failed to load configuration');
    }
  },
  
  updateConfig: async (key: string, value: ConfigValue) => {
    try {
      set({ isLoading: true });
      await projectService.updateConfig(key, value);
      
      set((state) => ({
        ...state,
        config: state.config ? {
          ...state.config,
          [key]: value
        } : null,
        isLoading: false
      }));
      
      toast.success('Configuration updated successfully');
    } catch (error) {
      console.error('Failed to update config:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to update configuration',
        isLoading: false
      });
      toast.error('Failed to update configuration');
      throw error;
    }
  },
});

export const useProjectConfigStore = create<Store>()(
  devtools(
      store,
      {
        name: 'project-config-store',
      }
   
  )
);

// Initialize the store when the app loads
const initializeConfig = () => {
  const store = useProjectConfigStore.getState();
  if (!store.config) {
    store.fetchConfig();
  }
};

// Call initialize when the store is imported
if (typeof window !== 'undefined') {
  initializeConfig();
}
