import React from 'react';
import { Input } from '../ui/Input';
import type { ConfigData } from '../../services/configService';

interface PushNotificationSettingsProps {
  data: ConfigData;
  onChange: (field: keyof ConfigData, value: any) => void;
}

export const PushNotificationSettings: React.FC<PushNotificationSettingsProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-table-header-text mb-6">Push Notification Configuration</h3>
      
      <div className="grid grid-cols-1 gap-6 border-1 border-table-divider p-4 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            OneSignal App ID
          </label>
          <Input
            type="text"
            value={data.one_signal_app_id || ''}
            onChange={(e) => onChange('one_signal_app_id', e.target.value)}
            placeholder="Enter OneSignal App ID"
            className="w-full border border-table-divider"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            OneSignal API Key
          </label>
          <Input
            type="password"
            value={data.one_signal_api_key || ''}
            onChange={(e) => onChange('one_signal_api_key', e.target.value)}
            placeholder="Enter OneSignal API Key"
            className="w-full border border-table-divider"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            Android Channel ID
          </label>
          <Input
            type="text"
            value={data.android_channel_id || ''}
            onChange={(e) => onChange('android_channel_id', e.target.value)}
            placeholder="Enter Android Channel ID"
            className="w-full border border-table-divider"
          />
        </div>
      </div>
    </div>
  );
};
