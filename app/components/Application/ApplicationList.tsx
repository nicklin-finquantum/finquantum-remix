import React, { useState, useEffect } from "react";
import {
  checkAdmin,
  checkOrgRole,
  fetchDataList,
  formatDate,
  formatTime,
  getProductUrl,
  handleArchiveApiRequest,
  handleArchiveConfirmation,
  sendRequest,
} from "../../utils/utils";
import {
  APPLICATION_LIST_API,
  APPLICATION_ARCHIVE_API,
  APPLICATION_LIST_ARCHIVED_API,
  APPLICATION_UNARCHIVE_API,
  ORG_USER_LIST_API,
  APPLICATION_ASSIGN_API,
  OVERVIEW_APPLICATION_PATH,
  APPLICATION_LIST_ORG_ALL_API,
  APPLICATION_LIST_ORG_ARCHIVED_API,
  APPLICATION_LIST_All_API,
  EDIT_APPLICATION_PATH,
} from "../../utils/consts";
import { APPLICATION } from "../../types/application";
import { Product } from "../../types/product";
import { Link, useLocation, useParams } from "react-router-dom";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  ListItemIcon,
  Popper,
  ClickAwayListener,
  MenuItem,
  Paper,
} from "@mui/material";
import { Archive, ArrowOutward, Unarchive } from "@mui/icons-material";
import useModal from "../../hooks/useModal";
import { useUser } from "../../hooks/useUser";
import { OverviewType } from "../../types/overviewType";
import useSearch from "../../hooks/useSearch";
import { USER } from "../../types/user";

const ApplicationList: React.FC<{
  product: Product;
  type?: OverviewType;
  isArchive?: boolean;
  getAll?: boolean;
}> = ({ product, type = "overview", isArchive = false, getAll = false }) => {
  const { orgId, userId } = useParams();
  const location = useLocation();
  const { user } = useUser();
  const isAdmin = checkAdmin(user);
  const isOrgAdmin = checkOrgRole(user);
  const {
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
  } = useModal();

  const { filteredList, setFullList, SearchField } = useSearch<APPLICATION>(
    ["userApplicationId", "owner"],
    "Enter File Number (example: 12334456)",
  );

  const [userList, setUserList] = useState<USER[]>([]);
  const [reassignId, setReassignId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const getDataList = async () => {
      try {
        const data = await fetchDataList(
          isArchive
            ? getAll && type === "admin" && isAdmin
              ? APPLICATION_LIST_ARCHIVED_API
              : isOrgAdmin
              ? APPLICATION_LIST_ORG_ARCHIVED_API
              : APPLICATION_LIST_ARCHIVED_API
            : getAll && type === "admin" && isAdmin
            ? APPLICATION_LIST_All_API
            : isOrgAdmin
            ? APPLICATION_LIST_ORG_ALL_API
            : APPLICATION_LIST_API,
          { product, userId: userId ?? user.id, ...(isOrgAdmin && { orgId }) },
        );
        const newDataList = data.applicationList.map((item: APPLICATION) => ({
          ...item,
          creationTime:
            formatDate(item.createdAt) + " " + formatTime(item.createdAt),
        }));
        setFullList(newDataList);
      } catch (error) {
        console.error("Failed to fetch application list:", error);
      }
    };
    const getUserList = async () => {
      try {
        const data = await fetchDataList(ORG_USER_LIST_API, { product });
        setUserList(data.userList);
      } catch (error) {
        console.error("Failed to fetch user list:", error);
      }
    };
    getDataList();
    getUserList();
  }, [location]);

  const handleArchive = (id: string, name: string, unarchive: boolean) => {
    handleArchiveConfirmation(
      name,
      unarchive,
      () => handleArchiveOk(id, unarchive),
      openModal,
      handleCancel,
      setMessage,
      setOkFunction,
      setCancelFunction,
    );
  };

  const handleArchiveOk = async (id: string, unarchive: boolean) => {
    closeModal();
    await handleArchiveApiRequest(
      unarchive ? APPLICATION_UNARCHIVE_API : APPLICATION_ARCHIVE_API,
      { product, id, ...(isOrgAdmin && { orgId }) },
      unarchive,
      "File",
      setMessage,
      setOkFunction,
      setCancelFunction,
      handleOk,
      handleOkReload,
      () =>
        handleOkRedirect(
          `${getProductUrl(product)}${OVERVIEW_APPLICATION_PATH}`,
        ),
      openModal,
    );
  };

  const handleAssignClick = (
    event: React.MouseEvent<HTMLElement>,
    id: string,
  ) => {
    setReassignId(id);
    setAnchorEl(event.currentTarget);
  };

  const handleReassign = async (applicationId: string, userId: string) => {
    try {
      const response = await sendRequest(
        APPLICATION_ASSIGN_API,
        "POST",
        {
          id: applicationId,
          userId: userId,
          product: product,
        },
        true,
      );
      if (response.status === 200) {
        setMessage(<span className="font-bold">{"File reassigned"}</span>);
        setOkFunction(handleOkReload);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setMessage(
        <span>
          <span className="font-bold">{"File reassign failed."}</span>,
          {error instanceof Error ? error.message : "Internal Error"}
        </span>,
      );
      setOkFunction(handleOk);
    } finally {
      openModal();
    }
  };

  const handleClickAway = () => {
    setReassignId(null);
    setAnchorEl(null);
  };

  const columns: GridColDef[] = [
    {
      field: "userApplicationId",
      headerName: "File No.",
      renderCell: (param) => {
        return (
          <Link
            to={`${getProductUrl(
              product,
            )}${EDIT_APPLICATION_PATH}?applicationId=${param.row.id}`}
            className="underline"
          >
            {param.row.userApplicationId}
          </Link>
        );
      },
      flex: 1,
    },
    { field: "owner", headerName: "Owner", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "creationTime", headerName: "Creation Time", flex: 1 },
    ...(isOrgAdmin && !isArchive && type !== "admin"
      ? [
          {
            field: "reassign",
            headerName: "Re-Assign",
            sortable: false,
            renderCell: (param) => {
              return (
                <Box key={param.row.id}>
                  <ListItemIcon
                    className="cursor-pointer align-middle pl-3"
                    onClick={(event) => handleAssignClick(event, param.row.id)}
                  >
                    <ArrowOutward />
                  </ListItemIcon>
                  <Popper
                    open={reassignId === param.row.id}
                    anchorEl={anchorEl}
                    placement="bottom-start"
                    disablePortal
                  >
                    <ClickAwayListener onClickAway={handleClickAway}>
                      <Paper
                        sx={{
                          p: 1,
                          boxShadow: 3,
                          borderRadius: 1,
                          maxHeight: 200, // Set max height to 200px for 5 items (~40px/item)
                          overflowY: "auto", // Enable vertical scrolling if items exceed maxHeight
                        }}
                      >
                        {userList.map((user) => (
                          <MenuItem
                            key={user.id}
                            onClick={() =>
                              handleReassign(param.row.id, user.id)
                            }
                          >
                            {user.firstName + " " + user.lastName}
                          </MenuItem>
                        ))}
                      </Paper>
                    </ClickAwayListener>
                  </Popper>
                </Box>
              );
            },
          },
        ]
      : []),
    ...(type === "overview"
      ? [
          isArchive
            ? {
                field: "unarchive",
                headerName: "Unarchive",
                sortable: false,
                renderCell: (param) => {
                  return (
                    <ListItemIcon className="cursor-pointer align-middle pl-3">
                      <Unarchive
                        onClick={() =>
                          handleArchive(
                            param.row.id,
                            param.row.userApplicationId,
                            true,
                          )
                        }
                      />
                    </ListItemIcon>
                  );
                },
              }
            : {
                field: "archive",
                headerName: "Archive",
                sortable: false,
                renderCell: (param) => {
                  return (
                    <ListItemIcon className="cursor-pointer align-middle pl-3">
                      <Archive
                        onClick={() =>
                          handleArchive(
                            param.row.id,
                            param.row.userApplicationId,
                            false,
                          )
                        }
                      />
                    </ListItemIcon>
                  );
                },
              },
        ]
      : []),
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
          localeText={{ noRowsLabel: "No file found" }}
        />
      </Box>
    </Box>
  );
};

export default ApplicationList;
