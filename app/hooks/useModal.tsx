import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import React, {
  useReducer,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";

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
  setOkText: (message: String) => void;
  setCancelText: (message: String) => void;
}

const useModal = (): UseModalResult => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [okText, setOkText] = useState<String>("OK");
  const [cancelText, setCancelText] = useState<String>("Cancel");
  const [message, setMessage] = useState<React.ReactNode>(<></>);
  const [okFunction, setOkFunction] = useState<() => void>(() => {});
  const [cancelFunction, setCancelFunction] = useState<
    (() => void) | undefined
  >(undefined);
  const navigate = useNavigate();

  const openModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleOk = useCallback(
    () => () => {
      closeModal();
    },
    [],
  );

  const handleOkReload = useCallback(
    () => () => {
      window.location.reload();
    },
    [],
  );

  const handleOkRedirect = useCallback(
    (url: string, otherFunction?: () => any) => {
      return () => {
        closeModal();
        otherFunction && otherFunction();
        navigate(url);
      };
    },
    [navigate],
  );

  const handleCancel = useCallback(
    () => () => {
      closeModal();
    },
    [],
  );

  const handleCancelReload = useCallback(
    () => () => {
      window.location.reload();
    },
    [],
  );

  const Modal = (
    <Dialog
      maxWidth="md"
      open={showModal}
      className="modal-container flex flex-col text-lg p3"
    >
      <DialogContent className="modal-content !p-10 grid w-full">
        {message}
      </DialogContent>
      <DialogActions className="modal-buttons self-end flex gap-8">
        <Button
          className="modal-ok"
          onClick={okFunction ?? handleOk}
          type="button"
          variant="contained"
          color="primary"
        >
          {okText}
        </Button>
        {cancelFunction && (
          <Button
            className="modal-cancel"
            onClick={cancelFunction}
            type="button"
            variant="outlined"
            color="secondary"
          >
            {cancelText}
          </Button>
        )}
      </DialogActions>
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
