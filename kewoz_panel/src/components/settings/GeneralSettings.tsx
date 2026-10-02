import React from 'react';
import { Input } from '../ui/Input';
import { ColorPicker } from '../ui/ColorPicker';
import type { ConfigData } from '../../services/configService';
import { X } from 'lucide-react';

interface GeneralSettingsProps {
  data: ConfigData;
  onChange: (field: keyof ConfigData, value: any) => void;
  onFileChange: (field: keyof ConfigData, event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove?: (field: keyof ConfigData) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  data,
  onChange,
  onFileChange,
  onFileRemove,
}) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-extrabold text-table-header-text mb-4 px-2">
        Configuración General
      </h3>

      {/* App/Website Info */}
      <div className="border border-table-divider rounded-md grid grid-cols-1 md:grid-cols-2 gap-6 p-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            Nombre de la App/Sitio Web
          </label>
          <Input
            type="text"
            value={data.app_name || ''}
            onChange={(e) => onChange('app_name', e.target.value)}
            placeholder="Ingresa el nombre de la app/sitio web"
            className="w-full border border-table-divider"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            Correo de Contacto
          </label>
          <Input
            type="email"
            value={data.app_email || ''}
            onChange={(e) => onChange('app_email', e.target.value)}
            placeholder="Ingresa el correo de contacto"
            className="w-full border border-table-divider"
          />
        </div>
      </div>

      {/* Logo Uploads */}
      <div className="border border-table-divider rounded-md grid grid-cols-1 md:grid-cols-2 gap-6 p-4 mb-4">
        {[
          { label: 'Logo Web Claro', field: 'web_logo_light' },
          { label: 'Logo Web Oscuro', field: 'web_logo_dark' },
          { label: 'Logo App Claro', field: 'app_logo_light' },
          { label: 'Logo App Oscuro', field: 'app_logo_dark' },
        ].map(({ label, field }) => (
          <div key={field}>
            <label className="block text-sm font-medium text-text-muted mb-2">
              {label}
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
              <input
                type="file"
                id={`${field}-upload`}
                accept="image/*"
                className="hidden"
                onChange={(e) => onFileChange(field as keyof ConfigData, e)}
              />
              <label
                htmlFor={`${field}-upload`}
                className="px-3 py-2  text-sm text-black bg-gray-200 rounded-lg cursor-pointer hover:opacity-90 transition"
              >
                Elegir archivo
              </label>
              <span className="text-sm text-text-muted truncate max-w-[200px]">
                {data[field as keyof ConfigData]
                  ? String(data[field as keyof ConfigData]).split('/').pop()
                  : 'Ningún archivo seleccionado'}
              </span>
            </div>
            {data[field as keyof ConfigData] && (
              <div className="mt-3 relative inline-block">
                <img
                  src={String(data[field as keyof ConfigData])}
                  alt={label}
                  className="h-16 w-auto object-contain"
                />
                {onFileRemove && (
                  <button
                    type="button"
                    onClick={() => onFileRemove(field as keyof ConfigData)}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 shadow-md transition-colors"
                    title={`Eliminar ${label}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Colors & Copyright */}
      <div className="border border-table-divider rounded-md grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {/* Primary Color Picker */}
        <ColorPicker
          label="Color Primario"
          value={data.app_primary_color || '#FCC604'}
          onChange={(color) => onChange('app_primary_color', color)}
          className="text-text-muted"
        />

        {/* Secondary Color Options */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-text-muted mb-2">
            Color del Texto del Botón
          </label>
          <div className="flex gap-4">
            {[
              { color: '#FFFFFF', label: 'Blanco' },
              { color: '#000000', label: 'Negro' },
            ].map(({ color, label }) => {
              const isSelected = data.app_secondary_color === color;
              return (
                <div
                  key={color}
                  onClick={() => onChange('app_secondary_color', color)}
                  className={`relative w-12 h-12 rounded-md border-2 cursor-pointer transition
              ${isSelected ? 'border-primary shadow-md' : 'border-table-divider'}
            `}
                  style={{ backgroundColor: color }}
                >
                  {isSelected && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute top-1 right-1 h-5 w-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Copyright Field */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text-muted mb-2">
            Texto de Copyright
          </label>
          <Input
            type="text"
            value={data.copyright_text || ''}
            onChange={(e) => onChange('copyright_text', e.target.value)}
            placeholder="Ingresa el texto de copyright"
            className="w-full border border-table-divider"
          />
        </div>
      </div>

    </div>
  );
};
