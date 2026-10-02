import React, { useRef } from 'react';
import { Input } from '../ui/Input';
import { Toggle } from '../ui/Toggle';
import type { ConfigData } from '../../services/configService';

interface SMSSettingsProps {
  data: ConfigData;
  onChange: (field: keyof ConfigData, value: any) => void;
  onMultiChange: (updates: Partial<ConfigData>) => void;
}

export const SMSSettings: React.FC<SMSSettingsProps> = ({
  data,
  onChange,
  onMultiChange,
}) => {
  const firebaseJsonRef = useRef<HTMLInputElement>(null);

  const firebaseEnabled = data.is_firebase_auth_enabled === true || data.is_firebase_auth_enabled === 'true';
  const twilioEnabled = data.is_twilio_enabled === 'true';
  const msg91Enabled = data.is_msg91_enabled === 'true';

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-extrabold text-table-header-text mb-6">Configuración de SMS</h3>

      {/* Firebase Authentication */}
      <div className="grid grid-cols-1 gap-6 border-1 border-table-divider p-4 rounded-lg">
        <div>
          <div className='w-full flex justify-between items-center mb-6'>
            <div className='text-md font-bold text-table-header-text'>
              Autenticación de Firebase
            </div>
            <Toggle
              id="is_firebase_auth_enabled"
              checked={firebaseEnabled}
              onChange={(checked) => {
                onMultiChange({
                  is_firebase_auth_enabled: checked,
                  is_twilio_enabled: checked ? 'false' : data.is_twilio_enabled,
                  is_msg91_enabled: checked ? 'false' : data.is_msg91_enabled,
                });
              }}
              label="Firebase"
            />
          </div>

          <label className="block text-sm font-medium text-text-muted mb-2">
            Clave API de Firebase
          </label>
          <Input
            type="text"
            value={data.firebase_auth_api_key || ''}
            readOnly
            placeholder="Ingresa la Clave API de Firebase"
            className="w-full border border-table-divider bg-gray-100 cursor-not-allowed"
          />

          <div className="mt-4">
            <label className="block text-sm font-medium text-text-muted mb-2">
              ID del Proyecto Firebase
            </label>
            <Input
              type="text"
              value={data.firebase_auth_project_id || ''}
              onChange={(e) => onChange('firebase_auth_project_id', e.target.value)}
              placeholder="Ingresa el ID del Proyecto Firebase"
              className="w-full border border-table-divider"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-text-muted mb-2">
              JSON de Cuenta de Servicio
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
              <input
                ref={firebaseJsonRef}
                type="file"
                id="firebase-auth-json"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const text = ev.target?.result as string;
                      onChange('firebase_auth_service_json', text);
                    };
                    reader.readAsText(e.target.files[0]);
                  }
                }}
              />
              <label
                htmlFor="firebase-auth-json"
                className="px-3 py-2 text-sm text-black bg-gray-200 rounded-lg cursor-pointer hover:opacity-90 transition"
              >
                Elegir archivo
              </label>
              <span className="text-sm text-text-muted truncate max-w-[200px]">
                {data.firebase_auth_service_json
                  ? (data.firebase_auth_service_json.startsWith('{') ? 'Archivo cargado' : data.firebase_auth_service_json.split('/').pop() || 'Archivo seleccionado')
                  : 'Ningún archivo seleccionado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Twilio */}
      <div className="grid grid-cols-1 gap-6 border-1 border-table-divider p-4 rounded-lg">
        <div>
          <div className='w-full flex justify-between items-center mb-6'>
            <div className='text-md font-bold text-table-header-text '>
              Configuración de Twilio
            </div>
            <Toggle
              id="is_twilio_enabled"
              checked={twilioEnabled}
              onChange={(checked) => {
                onMultiChange({
                  is_twilio_enabled: checked.toString(),
                  is_msg91_enabled: checked ? 'false' : data.is_msg91_enabled,
                  is_firebase_auth_enabled: checked ? false : data.is_firebase_auth_enabled,
                });
              }}
              label="Twilio"
            />
          </div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            SID de Cuenta de Twilio
          </label>
          <Input
            type="text"
            value={data.twilio_account_sid || ''}
            onChange={(e) => onChange('twilio_account_sid', e.target.value)}
            placeholder="Ingresa el SID de Cuenta de Twilio"
            className="w-full border border-table-divider"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            Token de Autenticación de Twilio
          </label>
          <Input
            type="password"
            value={data.twilio_auth_token || ''}
            onChange={(e) => onChange('twilio_auth_token', e.target.value)}
            placeholder="Ingresa el Token de Autenticación de Twilio"
            className="w-full border border-table-divider"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            Número de Teléfono de Twilio
          </label>
          <Input
            type="tel"
            value={data.twilio_phone_number || ''}
            onChange={(e) => onChange('twilio_phone_number', e.target.value)}
            placeholder="Ingresa el número de teléfono de Twilio"
            className="w-full border border-table-divider"
          />
        </div>
      </div>

      {/* MSG 91 */}
      <div className="grid grid-cols-1 gap-6 border-1 border-table-divider p-4 rounded-lg">
        <div>
          <div className='w-full flex justify-between items-center mb-6'>
            <div className='text-md font-bold text-table-header-text '>
              Configuración de MSG 91
            </div>
            <Toggle
              id="is_msg91_enabled"
              checked={msg91Enabled}
              onChange={(checked) => {
                onMultiChange({
                  is_msg91_enabled: checked.toString(),
                  is_twilio_enabled: checked ? 'false' : data.is_twilio_enabled,
                  is_firebase_auth_enabled: checked ? false : data.is_firebase_auth_enabled,
                });
              }}
              label="MSG 91"
            />
          </div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            ID del Remitente MSG 91
          </label>
          <Input
            type="text"
            value={data.msg91_sender_id || ''}
            onChange={(e) => onChange('msg91_sender_id', e.target.value)}
            placeholder="Ingresa el ID del Remitente MSG 91"
            className="w-full border border-table-divider"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            Clave API de MSG 91
          </label>
          <Input
            type="password"
            value={data.msg91_api_key || ''}
            onChange={(e) => onChange('msg91_api_key', e.target.value)}
            placeholder="Ingresa la Clave API de MSG 91"
            className="w-full border border-table-divider"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            ID de Plantilla MSG 91
          </label>
          <Input
            type="tel"
            value={data.msg91_template_id || ''}
            onChange={(e) => onChange('msg91_template_id', e.target.value)}
            placeholder="Ingresa el ID de Plantilla MSG 91"
            className="w-full border border-table-divider"
          />
        </div>
      </div>

    </div>
  );
};

 