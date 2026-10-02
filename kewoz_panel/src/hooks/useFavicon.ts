import { useEffect } from 'react';
import { useThemeStore } from '@/store/theme/themeStore';
import { useProjectConfigStore } from '@/stores/useProjectConfigStore';

export const useFavicon = () => {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const config = useProjectConfigStore((state) => state.config);

  useEffect(() => {
    if (!config) return;

    const faviconLink = document.querySelector<HTMLLinkElement>("link[rel~='icon']") || 
      document.createElement('link');
    
    faviconLink.rel = 'icon';
    
    // Use the appropriate favicon based on the theme
    const faviconUrl = resolvedTheme === 'dark' 
      ? config.web_logo_dark || config.web_logo_light
      : config.web_logo_light;

    if (faviconUrl && faviconUrl !== faviconLink.href) {
      faviconLink.href = faviconUrl;
      
      if (!document.head.contains(faviconLink)) {
        document.head.appendChild(faviconLink);
      }
    }
    if (config.app_name) {
      document.title = config.app_name;
    } else {
      document.title = 'My App'; // default fallback
    }
  }, [resolvedTheme, config]);
};
