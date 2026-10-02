import React from 'react';

interface SettingsSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sidebarItems = [
  {
    id: 'general',
    label: 'Configuración General',
    icon: '⚙️',
  },
  {
    id: 'sms',
    label: 'Configuración de SMS',
    icon: '📱',
  },
  {
    id: 'push',
    label: 'Configuración de Notificaciones Push',
    icon: '🔔',
  },
  {
    id: 'purchase',
    label: 'Código de Compra',
    icon: '🛒',
  },
  {
    id: 'banner',
    label: 'Configurar Banner',
    icon: '🖼️',
  },
];

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  activeSection,
  onSectionChange,
}) => {
  return (
    <div className="  lg:min-h-screen">
      <div className="p-3 mt-4">
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center p-3  text-left rounded-lg transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-primary-dark text-button-text shadow-md'
                  : 'text-table-header-text hover:bg-table-row-hover border border-table-divider'
              }`}
            >
              <div className="flex items-center justify-center w-8 h-8 mr-3 flex-shrink-0">
                <span className="text-lg">{item.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium  leading-5 block">{item.label}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
