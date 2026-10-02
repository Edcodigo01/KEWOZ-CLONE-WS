import { BaseApiService } from '@/services/api/baseApi';
import { useProjectConfigStore } from '@/stores/useProjectConfigStore';
import type { ProjectConfiguration } from '@/types/project_configuration';

type ConfigValue = string | number | boolean | File | null | undefined;

export class ProjectService extends BaseApiService {
  constructor() {
    super('config');
  }

  /**
   * Get project configuration
   */
  async getProjectConfig(): Promise<ProjectConfiguration> {
    return this.get<ProjectConfiguration>('/');
  }

  /**
   * Update project configuration
   * @param data - Either a FormData object for file uploads or a record of config values
   */
  async updateConfig(data: Record<string, ConfigValue> | FormData): Promise<ProjectConfiguration> {
    if (data instanceof FormData) {
      return this.put<ProjectConfiguration>('/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      // Filter out undefined values before sending
      const payload = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, ConfigValue>);
      
      return this.put<ProjectConfiguration>('/', payload);
    }
  }
}

// Export a singleton instance
export const projectService = new ProjectService();
