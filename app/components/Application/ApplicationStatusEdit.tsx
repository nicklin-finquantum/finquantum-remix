import React, { useState, useEffect } from "react";
import { checkOrgRole, fetchDataList, sendRequest } from "../../utils/utils";
import {
  APPLICATION_LIST_API,
  APPLICATION_LIST_ARCHIVED_API,
  APPLICATION_LIST_ORG_ALL_API,
  APPLICATION_LIST_ORG_ARCHIVED_API,
  ORG_GET_API,
  APPLICATION_UPDATE_STATUS_API,
} from "../../utils/consts";
import { APPLICATION } from "../../types/application";
import { Product } from "../../types/product";
import { useLocation, useParams } from "react-router-dom";
import { DataGrid, gridClasses, GridColDef } from "@mui/x-data-grid";
import { Box, MenuItem, Select } from "@mui/material";
import useModal from "../../hooks/useModal";
import { useUser } from "../../hooks/useUser";
import { OverviewType } from "../../types/overviewType";
import useSearch from "../../hooks/useSearch";

const ApplicationStatusEdit: React.FC<{
  product?: Product;
  type?: OverviewType;
  isArchive?: boolean;
}> = ({
  product = Product.MORTGAGE_ANALYSIS,
  type = "overview",
  isArchive = false,
}) => {
  const location = useLocation();
  const { user } = useUser();
  const isOrgAdmin = checkOrgRole(user);
  const { Modal, openModal, setMessage, setOkFunction, handleOk } = useModal();

  const { filteredList, setFullList, SearchField } = useSearch<APPLICATION>(
    ["userApplicationId"],
    "Enter File Number (example: 12334456)",
  );

  const [statusList, setStatusList] = useState<string[]>([]);

  useEffect(() => {
    const getDataList = async () => {
      try {
        const data = await fetchDataList(
          isArchive
            ? isOrgAdmin
              ? APPLICATION_LIST_ORG_ARCHIVED_API
              : APPLICATION_LIST_ARCHIVED_API
            : isOrgAdmin
            ? APPLICATION_LIST_ORG_ALL_API
            : APPLICATION_LIST_API,
          { product },
        );
        setFullList(data.applicationList);
      } catch (error) {
        console.error("Failed to fetch application list:", error);
      }
    };

    const getStatusList = async () => {
      try {
        const data = await fetchDataList(ORG_GET_API, {
          product,
        });
        setStatusList(data.organization.mortgage_status_custom);
      } catch (error) {
        console.error("Failed to fetch status list:", error);
      }
    };
    getStatusList();
    getDataList();
  }, [location]);

  const handleStatusChange = async (
    applicationId: string,
    newStatus: string,
  ) => {
    try {
      const response = await sendRequest(
        APPLICATION_UPDATE_STATUS_API,
        "GET",
        {
          id: applicationId,
          status: newStatus,
          product: product,
        },
        true,
      );
      if (response.status === 200) {
        setFullList((prevList) =>
          prevList.map((application) =>
            application.id === applicationId
              ? { ...application, status: newStatus }
              : application,
          ),
        );
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setMessage(
        <span>
          <span className="font-bold">{"Status Update Failed: "}</span>,
          {error instanceof Error ? error.message : "Internal Error"}
        </span>,
      );
      setOkFunction(handleOk);
      openModal();
    }
  };

  const columns: GridColDef[] = [
    //{ field: "owner", headerName: "Owner", flex: 1 },
    { field: "userApplicationId", headerName: "File No.", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 2,
      renderCell: (params) => {
        const applicationId = params.row.id;
        return (
          <Box>
            <Select
              fullWidth
              value={params.value}
              onChange={(e) =>
                handleStatusChange(applicationId, e.target.value)
              }
              displayEmpty
              sx={{
                width: "calc(100% - 8px)",
              }}
            >
              {statusList.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </Box>
        );
      },
    },
  ];

  return (
    <Box className="h-full">
      {Modal}
      {SearchField}
      <Box className="datagrid-container">
        <DataGrid
          scrollbarSize={4}
          rows={filteredList}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25, page: 0 },
            },
          }}
          columns={columns}
          getRowHeight={() => "auto"}
          sx={{
            [`& .${gridClasses.row}`]: {
              py: 1,
            },
            [`& .${gridClasses.cell}`]: {
              height: "100%",
              alignSelf: "center",
            },
          }}
          localeText={{ noRowsLabel: "No file found" }}
        />
      </Box>
    </Box>
  );
};

export default ApplicationStatusEdit;
