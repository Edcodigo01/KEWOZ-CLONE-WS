import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui';
import { AvatarForm } from '@/components/forms/AvatarForm';
import { Modal } from '@/components/ui/Modal';
import { avatarService, type AvatarUploadParams } from '@/services/global/avatarService';
import { Breadcrumb } from '@/layouts';
import { useModal } from '@/contexts/ModalContext';
import { useToast } from '@/components/ui/Toast';

export default function AvatarManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setOpenAvatarModal } = useModal();
  const { toast } = useToast();

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  // Register the modal opener with the context so navbar can trigger it
  useEffect(() => {
    setOpenAvatarModal(handleOpenModal);
    return () => {
      setOpenAvatarModal(() => {});
    };
  }, [setOpenAvatarModal, handleOpenModal]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };


  return (
    <div className="space-y-4">
      <div className="mt-2">
        <Breadcrumb />
      </div>
  

      <div className="">
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload New Avatar</h3>
          <p className="text-gray-500 mb-4">Click the button above to add a new avatar to your collection.</p>
          <Button onClick={handleOpenModal}>
            Upload Avatar
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add New Avatar"
        size="sm"
      >
        <AvatarForm mode="create" />
      </Modal>
    </div>
  );
}
