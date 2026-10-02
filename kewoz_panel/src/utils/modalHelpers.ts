import { AvatarForm } from '@/components/forms/AvatarForm';

export const openAvatarModal = (modalContext: { open: (options: any) => void }) => {
  modalContext.open({
    component: AvatarForm,
    title: 'Add Avatar',
    size: 'md' as const,
  });
};
