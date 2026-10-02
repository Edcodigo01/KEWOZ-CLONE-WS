import React from 'react';
import { Input } from '../ui/Input';
import type { ConfigData } from '../../services/configService';

interface FinanceSettingsProps {
  data: ConfigData;
  onChange: (field: keyof ConfigData, value: any) => void;
}

export const FinanceSettings: React.FC<FinanceSettingsProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-extrabold text-text-muted mb-6">Finance Settings</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            Maximum Members in Group
          </label>
          <Input
            type="number"
            value={data.maximum_members_in_group || 10}
            onChange={(e) => onChange('maximum_members_in_group', parseInt(e.target.value))}
            placeholder="Enter maximum members"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            App Text
          </label>
          <Input
            type="text"
            value={data.app_text || ''}
            onChange={(e) => onChange('app_text', e.target.value)}
            placeholder="Enter app text"
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            iOS App Link
          </label>
          <Input
            type="url"
            value={data.app_ios_link || ''}
            onChange={(e) => onChange('app_ios_link', e.target.value)}
            placeholder="Enter iOS app link"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            Android App Link
          </label>
          <Input
            type="url"
            value={data.app_android_link || ''}
            onChange={(e) => onChange('app_android_link', e.target.value)}
            placeholder="Enter Android app link"
            className="w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm  text-text-muted mb-2">
          Tell a Friend Text
        </label>
        <div className='font-light text-text-muted'>

          <textarea
            value={data.app_tell_a_friend_text || ''}
            onChange={(e) => onChange('app_tell_a_friend_text', e.target.value)}
            placeholder="Enter tell a friend text"
            className="w-full  px-3 py-2 border border-table-divider rounded-lg "
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};
