import React, { useState } from "react";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { StatusType } from "../../types/statusType";
import { ORG_CREATE_API } from "../../utils/consts";
import { sendRequest } from "../../utils/utils";
import useModal from "../../hooks/useModal";
import { useUser } from "../../hooks/useUser";
import { Box, TextField, Button, InputAdornment } from "@mui/material";

const OrgInfoForm: React.FC<{ edit?: boolean }> = ({ edit = false }) => {
  const [name, setName] = useState("");
  const [nameStatus, setNameStatus] = useState<StatusType>("default");
  const [nameMessage, setNameMessage] = useState("");
  const { setUser } = useUser();

  const {
    Modal,
    openModal,
    setMessage,
    setOkFunction,
    handleOk,
    handleOkRedirect,
  } = useModal();

  const validateInput = (
    name: string,
    label: string,
    value: string | number,
  ) => {
    switch (name) {
      case "name":
        if (!value) {
          return `${label} is required`;
        }
        if (typeof value === "string" && value.length > 30) {
          return `${label} can not be longer than 30 characters`;
        }
        return "";
      default:
        return "";
    }
  };

  const validateAndSetField = (
    name: string,
    label: string,
    value: string | number,
  ) => {
    const errorMessage = validateInput(name, label, value);
    const status = errorMessage ? "error" : "default";

    if (name === "name") {
      setName(value as string);
      setNameStatus(status);
      setNameMessage(errorMessage);
    }

    return !errorMessage;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    validateAndSetField(
      name,
      name.charAt(0).toUpperCase() + name.slice(1),
      value,
    );
  };

  const validateForm = () => {
    const fieldsToValidate = [{ name: "name", label: "Name", value: name }];

    let isValid = true;

    fieldsToValidate.forEach((field) => {
      if (!validateAndSetField(field.name, field.label, field.value)) {
        isValid = false;
      }
    });

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const data = { name };

      const response = await sendRequest(ORG_CREATE_API, "POST", data, true);
      if (response.status === 200) {
        setMessage(
          <span className="font-bold">
            {edit ? "Organization Updated" : "Organization Added"}
          </span>,
        );
        setOkFunction(() => {
          return handleOkRedirect("/", () => setUser(null));
        });
        openModal();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setMessage(
        <span className="font-bold">
          {edit
            ? "Organization Update Failed: "
            : "Organization Create Failed: "}
          {error instanceof Error ? error.message : "Internal Error"}
        </span>,
      );
      setOkFunction(handleOk);
      openModal();
    }
  };

  return (
    <Box className="p-5 mb-5">
      {Modal}
      <Box className="p-7">
        <form onSubmit={handleSubmit}>
          <Box className="mb-5.5 flex flex-col gap-5.5 sm:flex-row sm:w-full md:w-1/2">
            <Box className="w-full">
              <Box className="input-label">Name</Box>
              <TextField
                name="name"
                value={name}
                error={nameStatus === "error"}
                helperText={nameMessage}
                onChange={handleChange}
                onBlur={handleChange}
                fullWidth
              />
            </Box>
          </Box>
          <Box className="flex justify-end gap-4.5">
            <Button variant="contained" type="submit">
              Save
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default OrgInfoForm;
