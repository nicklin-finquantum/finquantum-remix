import React, { useEffect, useRef, useState } from "react";
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
  APPLICANT_ARCHIVE_API,
  APPLICANT_LIST_ALL_API,
  APPLICANT_LIST_ALL_ARCHIVED_API,
  APPLICANT_LIST_API,
  APPLICANT_LIST_ARCHIVED_API,
  APPLICANT_LIST_ORG_ALL_API,
  APPLICANT_LIST_ORG_ARCHIVED_API,
  APPLICANT_UNARCHIVE_API,
  FILE_DOWNLOAD_API,
  OVERVIEW_APPLICANT_PATH,
} from "../../utils/consts";
import { APPLICANT } from "../../types/applicant";
import { Product } from "../../types/product";
import { Link, useLocation, useParams } from "react-router-dom";
import { DataGrid, GridColDef, gridClasses } from "@mui/x-data-grid";
import { Box, ListItemIcon, Typography, Tooltip } from "@mui/material";
import { Archive, Unarchive } from "@mui/icons-material";
import useModal from "../../hooks/useModal";
import { FILE } from "../../types/file";
import { OverviewType } from "../../types/overviewType";
import useSearch from "../../hooks/useSearch";
import { useUser } from "../../hooks/useUser";
import WebsocketService from "../Websockets/WebsocketService";
import CircularProgress from "@mui/material/CircularProgress";
import debounce from "lodash.debounce";

const ApplicantList: React.FC<{
  product: Product;
  type?: OverviewType;
  isArchive?: boolean;
  getAll?: boolean;
}> = ({ product, type, isArchive = false, getAll = false }) => {
  let { orgId, applicationId } = useParams();
  const location = useLocation();
  const { user } = useUser();
  orgId = orgId || user?.organization?.id;
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

  const { filteredList, setFullList, SearchField, setFilteredList, fullList } =
    useSearch<APPLICANT>(
      ["userApplicantId", "owner", "userApplicationId"],
      "Enter Applicant ID (example: GM124556)",
    );

  const websocketServicesRef = useRef([]);
  const [debouncedList, setDebouncedList] = useState([]);

  useEffect(() => {
    const getDataList = async () => {
      try {
        const data = await fetchDataList(
          isArchive
            ? getAll && type === "admin" && isAdmin
              ? APPLICANT_LIST_ALL_ARCHIVED_API
              : isOrgAdmin
              ? APPLICANT_LIST_ORG_ARCHIVED_API
              : APPLICANT_LIST_ARCHIVED_API
            : getAll && type === "admin" && isAdmin
            ? APPLICANT_LIST_ALL_API
            : isOrgAdmin
            ? APPLICANT_LIST_ORG_ALL_API
            : APPLICANT_LIST_API,
          {
            product,
            applicationId,
            ...(isOrgAdmin && { orgId }),
          },
        );
        const newDataList = data.applicantList.map((item) => ({
          ...item,
          creationTime:
            formatDate(item.createdAt) + " " + formatTime(item.createdAt),
        }));
        //console.log("Applicant List was set originally");
        setFullList(newDataList);
      } catch (error) {
        console.error("Failed to fetch applicant list:", error);
      }
    };
    getDataList();
  }, [location, applicationId, product]);

  // Debounce the filteredList updates
  const debounceFilteredList = useRef(
    debounce((newFilteredList) => {
      setDebouncedList(newFilteredList);
    }, 300),
  ).current;

  useEffect(() => {
    debounceFilteredList(fullList);
  }, [fullList]);

  useEffect(() => {
    const connectWebSockets = () => {
      const currentApplicantIds = new Set(
        debouncedList.map((applicant) => applicant.id),
      );
      const connectedAppIds = new Set(
        websocketServicesRef.current.map((ws) => ws.applicantId),
      );

      const newConnections = [];
      const activeConnections = [];

      try {
        websocketServicesRef.current.forEach((wsService) => {
          if (!currentApplicantIds.has(wsService.applicantId)) {
            //wsService.websocketService.closeFileSocket();
          } else {
            activeConnections.push(wsService);
          }
        });

        // Connect websockets for applicants with incomplete file uploads
        debouncedList.forEach((applicant) => {
          const applicantId = applicant.id;
          if (!connectedAppIds.has(applicantId)) {
            const websocketService = new WebsocketService();
            //console.log("Reps----:", applicant.fileInputs.creditReports);

            // Check that the applicant has any fileInputs that arent status.finished or status.error and only connect if so
            const hasPendingFiles =
              applicant.fileInputs?.creditReports &&
              Object.values(applicant.fileInputs.creditReports).some(
                (file: any) => file.status.percent < 100,
              );

            if (!hasPendingFiles) {
              //console.log("Skipping websocket connection for applicant", applicantId);
              return;
            }
            //console.log("Connecting websocket for applicant", applicant);

            websocketService.connectFileSocket(applicantId, handleFileUpdate);
            newConnections.push({ applicantId, websocketService });
          }
        });

        websocketServicesRef.current = [
          ...activeConnections,
          ...newConnections,
        ];
        console.log(
          "Count of document ws --- ",
          websocketServicesRef.current.length,
        );
      } catch (e) {
        console.error("Error connecting to WebSocket:", e);
      }
    };

    if (debouncedList.length > 0) {
      connectWebSockets();
    }

    return () => {
      websocketServicesRef.current.forEach((wsService) => {
        wsService.websocketService.closeFileSocket();
      });
      console.log(
        "Closing of document ws --- ",
        websocketServicesRef.current.length,
      );
    };
  }, [debouncedList]);

  const handleFileUpdate = (message) => {
    //console.log('WebSocket message received:', message);

    try {
      let fileId = message.fileId;
      // Update applicant.fileInputs.creditReports.status.percent

      // Update filtered list for UI
      const updatedList = filteredList.map((applicant) => {
        if (applicant.fileInputs) {
          Object.values(applicant.fileInputs.creditReports).forEach((file) => {
            if (file._id === fileId) {
              //console.log('Updating file:', file);
              file.status.percent = message.status.percent;
              file.status.error = message.status.error;
            }
          });
        }
        return applicant;
      });

      setFilteredList(updatedList);
      // Set full list to updated value but keep the rest of the list the same
      setFullList(
        fullList.map((applicant) => {
          if (applicant.fileInputs) {
            Object.values(applicant.fileInputs.creditReports).forEach(
              (file) => {
                if (file._id === fileId) {
                  file.status.percent = message.status.percent;
                }
              },
            );
          }
          return applicant;
        }),
      );
    } catch (e) {
      console.error("Error updating file status:", e);
    }
  };
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
      unarchive ? APPLICANT_UNARCHIVE_API : APPLICANT_ARCHIVE_API,
      { product, id, ...(isOrgAdmin && { orgId }) },
      unarchive,
      "Applicant",
      setMessage,
      setOkFunction,
      setCancelFunction,
      handleOk,
      handleOkReload,
      () =>
        handleOkRedirect(`${getProductUrl(product)}${OVERVIEW_APPLICANT_PATH}`),
      openModal,
    );
  };

  const handleDownload = async (id: string, name: string) => {
    try {
      const response = await sendRequest(
        FILE_DOWNLOAD_API,
        "POST",
        {
          product,
          id,
          ...((isOrgAdmin || isAdmin) && { orgId }),
        },
        true,
        (type !== "admin" && isOrgAdmin) || (type === "admin" && isAdmin),
        false,
      );
      if (response.status === 200) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setMessage("Download Initiated. Please check your Downloads folder.");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setMessage(
        <span>
          {"File Download Failed"}
          {error instanceof Error ? error.message : "Internal Error"}
        </span>,
      );
    } finally {
      setOkFunction(handleOk);
      setCancelFunction(undefined);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "userApplicantId",
      headerName: "Applicant ID",
      flex: 1,
      headerAlign: "left",
    },
    {
      field: "userApplicationId",
      headerName: "File No.",
      flex: 1,
      headerAlign: "left",
    },
    { field: "owner", headerName: "Owner", flex: 1, headerAlign: "left" },
    {
      field: "creationTime",
      headerName: "Creation Time",
      flex: 1,
      headerAlign: "left",
    },
    {
      field: "documents",
      headerName: "Documents",
      sortable: false,
      flex: 1.5,
      headerAlign: "left",
      renderCell: (param) => {
        const documents = param.row?.fileInputs
          ? Object.values(param.row.fileInputs).flatMap((fileList: FILE[]) =>
              fileList.map((file) => ({
                name: file.name,
                percent: file.status.percent,
                error: file.status.error,
                textStatus: file.status.text,
                textDetailed: file.status.text_detailed,
                id: file.id,
              })),
            )
          : [];

        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {documents.map((document, index) => (
              <Box key={index} display="flex" alignItems="center" mb={0}>
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  {document.percent === 100 && !document.error ? (
                    <Typography
                      variant="body1"
                      sx={
                        isArchive
                          ? { overflowWrap: "break-word" }
                          : {
                              overflowWrap: "break-word",
                              textDecoration: "underline",
                              cursor: "pointer",
                            }
                      }
                      onClick={
                        isArchive
                          ? null
                          : () => handleDownload(document.id, document.name)
                      }
                      title="Download"
                    >
                      {document.name}
                    </Typography>
                  ) : (
                    <Typography
                      variant="body1"
                      sx={{ overflowWrap: "break-word" }}
                    >
                      {document.name}
                    </Typography>
                  )}
                </Box>
                {!isArchive && (
                  <Box>
                    {document.percent !== 100 ? (
                      <Box
                        position="relative"
                        display="inline-flex"
                        ml={2}
                        mt={1}
                        mb={1}
                      >
                        <CircularProgress
                          size={40}
                          variant="determinate"
                          value={100}
                          sx={{ color: "gray" }}
                        />
                        <CircularProgress
                          value={document.percent}
                          size={40}
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            color: "primary.main",
                          }}
                        />
                        <Box
                          top={0}
                          left={0}
                          bottom={0}
                          right={0}
                          position="absolute"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Typography variant="caption" component="div">
                            {`${Math.round(document.percent)}%`}
                          </Typography>
                        </Box>
                      </Box>
                    ) : !document.error ? (
                      <Box
                        position="relative"
                        display="inline-flex"
                        ml={2}
                        mt={1}
                        mb={1}
                      >
                        <CircularProgress
                          size={40}
                          variant="determinate"
                          value={100}
                          sx={{ color: "primary.main" }}
                        />
                        <Box
                          top={0}
                          left={0}
                          bottom={0}
                          right={0}
                          position="absolute"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Typography variant="caption" component="div">
                            {`${Math.round(document.percent)}%`}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Tooltip
                        title={
                          <Typography variant={"caption"}>
                            We are unable to process this document as the
                            content is either incomplete or cropped. Please make
                            sure it is a complete CreditKarma document in PDF
                            format and try again; refer to our{" "}
                            <Link
                              className="text-sky-400 underline"
                              to="https://docs.google.com/document/d/1VqmWPB-I1zn4DhDfK0nEIyErJjo7aH0cAucMCLYzOuw/edit"
                              target="_blank"
                              rel="noopener"
                            >
                              report download instructions
                            </Link>{" "}
                            as needed. If the issue persists, please{" "}
                            <Link
                              className="text-sky-400 underline"
                              to="mailto: customersupport@finquantuminc.com"
                              target="_blank"
                              rel="noopener"
                            >
                              contact customer support
                            </Link>
                            .
                          </Typography>
                        }
                      >
                        <Box
                          position="relative"
                          display="inline-flex"
                          ml={2}
                          mt={1}
                          mb={1}
                        >
                          <CircularProgress
                            size={40}
                            variant="determinate"
                            value={100}
                            sx={{ color: "error.main" }}
                          />
                          <Box
                            top={0}
                            left={0}
                            bottom={0}
                            right={0}
                            position="absolute"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Typography
                              variant="caption"
                              component="div"
                              sx={{ color: "error.main" }}
                            >
                              Error
                            </Typography>
                          </Box>
                        </Box>
                      </Tooltip>
                    )}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        );
      },
    },
    ...(type === "overview"
      ? [
          isArchive
            ? {
                field: "unarchive",
                headerName: "Unarchive",
                sortable: false,
                flex: 0.5,
                renderCell: (param) => {
                  return (
                    <ListItemIcon className="cursor-pointer align-middle pl-3">
                      <Unarchive
                        onClick={() =>
                          handleArchive(
                            param.row.id,
                            param.row.userApplicantId,
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
                flex: 0.5,
                renderCell: (param) => {
                  return (
                    <ListItemIcon className="cursor-pointer align-middle pl-3">
                      <Archive
                        onClick={() =>
                          handleArchive(
                            param.row.id,
                            param.row.userApplicantId,
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
          localeText={{ noRowsLabel: "No applicant found" }}
          getRowHeight={() => "auto"}
          sx={{
            [`& .${gridClasses.row}`]: {
              py: 2,
            },
            [`& .${gridClasses.cell}`]: {
              height: "100%",
              alignSelf: "center",
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default ApplicantList;
