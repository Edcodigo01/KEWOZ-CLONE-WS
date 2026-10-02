import React from 'react';
import { Toggle } from '../ui/Toggle';
import type { ConfigData } from '../../services/configService';

interface LoginSettingsProps {
  data: ConfigData;
  onChange: (field: keyof ConfigData, value: any) => void;
}

export const LoginSettings: React.FC<LoginSettingsProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-text-muted mb-6">Login Configuration</h3>
      
      <div className="space-y-4">
        <Toggle
          id="user_name_flow"
          checked={data.user_name_flow || false}
          onChange={(checked) => onChange('user_name_flow', checked)}
          label="Enable User Name Flow"
          className='border border-table-row-hover rounded-[50px] p-2'
        />
        
        <Toggle
          id="contact_flow"
          checked={data.contact_flow || false}
          onChange={(checked) => onChange('contact_flow', checked)}
          label="Enable Contact Flow"
          className='border border-table-row-hover rounded-[50px] p-2'
        />

        <Toggle
          id="phone_authentication"
          checked={data.phone_authentication || false}
          onChange={(checked) => onChange('phone_authentication', checked)}
          label="Enable Phone Authentication"
          className=' border border-table-row-hover rounded-[50px] p-2'
        />

        <Toggle
          id="email_authentication"
          checked={data.email_authentication || false}
          onChange={(checked) => onChange('email_authentication', checked)}
          label="Enable Email Authentication"
          className=' border border-table-row-hover rounded-[50px] p-2' />
      </div>
    </div>
  );
};
