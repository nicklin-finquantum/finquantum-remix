import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '~/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '~/components/ui/dialog';

interface UseModalResult {
  Modal: React.ReactNode;
  openModal: () => void;
  closeModal: () => void;
  setMessage: (message: React.ReactNode) => void;
  setOkFunction: (fn: () => void) => void;
  setCancelFunction: (fn: (() => void) | undefined) => void;
  handleOk: () => void;
  handleOkReload: () => void;
  handleOkRedirect: (url: string, otherFunction?: () => any) => void;
  handleCancel: () => void;
  handleCancelReload: () => void;
  setOkText: (text: string) => void;
  setCancelText: (text: string) => void;
}

const useModal = (): UseModalResult => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [okText, setOkText] = useState<string>('OK');
  const [cancelText, setCancelText] = useState<string>('Cancel');
  const [message, setMessage] = useState<React.ReactNode>(<></>);
  const [okFunction, setOkFunction] = useState<() => void>(() => {});
  const [cancelFunction, setCancelFunction] = useState<(() => void) | undefined>(undefined);
  const navigate = useNavigate();

  const openModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleOk = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const handleOkReload = useCallback(() => {
    window.location.reload();
  }, []);

  const handleOkRedirect = useCallback(
    (url: string, otherFunction?: () => any) => {
      return () => {
        closeModal();
        otherFunction?.();
        navigate(url);
      };
    },
    [navigate, closeModal],
  );

  const handleCancel = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const handleCancelReload = useCallback(() => {
    window.location.reload();
  }, []);

  const Modal = (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-4">
          {message}
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-4">
          <Button
            variant="default"
            onClick={okFunction ?? handleOk}
            type="button"
          >
            {okText}
          </Button>
          {cancelFunction && (
            <Button
              variant="outline"
              onClick={cancelFunction}
              type="button"
            >
              {cancelText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return {
    Modal,
    openModal,
    closeModal,
    setMessage,
    setOkFunction,
    setCancelFunction,
    handleOk,
    handleOkReload,
    handleOkRedirect,
    handleCancel,
    handleCancelReload,
    setOkText,
    setCancelText,
  };
};

export default useModal;
