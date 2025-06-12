import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  fetchDataList,
  handleArchiveApiRequest,
  handleArchiveConfirmation,
  formatDate,
  formatTime,
  sendRequest,
  checkAdmin,
  getProductUrl,
  checkOrgRole,
} from "../../utils/utils";
import {
  REPORT_DOWNLOAD_API,
  REPORT_ARCHIVE_API,
  REPORT_VALIDATE_API,
  REPORT_LIST_ARCHIVED_API,
  REPORT_UNARCHIVE_API,
  OVERVIEW_REPORT_PATH,
  REPORT_LIST_ORG_ALL_API,
  REPORT_LIST_API,
  REPORT_LIST_ORG_ARCHIVED_API,
  REPORT_LIST_ALL_ARCHIVED_API,
  REPORT_LIST_ALL_API,
} from "../../utils/consts";
import { Product } from "../../types/product";
import { REPORT } from "../../types/report";
import useModal from "../../hooks/useModal";
import WebsocketService from "../Websockets/WebsocketService";
import { SortConfig, requestSort, sortArray } from "../../utils/tableSorting";
import { Box, IconButton, ListItemIcon, Tooltip } from "@mui/material";
import { DataGrid, gridClasses, GridColDef } from "@mui/x-data-grid";
import InfoIcon from "@mui/icons-material/Info";
import {
  AccessTime,
  Archive,
  Check,
  Download,
  ThumbUp,
  Unarchive,
} from "@mui/icons-material";
import { OverviewType } from "../../types/overviewType";
import useSearch from "../../hooks/useSearch";
import { useUser } from "../../hooks/useUser";
import debounce from "lodash.debounce";

const ReportList: React.FC<{
  product: Product;
  type?: OverviewType;
  isArchive?: boolean;
  download?: boolean;
  getAll?: boolean;
}> = ({
  product,
  type = "overview",
  isArchive = false,
  download = false,
  getAll = false,
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const { hash } = useLocation();

  const { user } = useUser();
  const isAdmin = checkAdmin(user);
  const isOrgAdmin = checkOrgRole(user);
  const location = useLocation();

  const websocketServicesRef = useRef([]);
  const [debouncedList, setDebouncedList] = useState([]);

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

  const {
    filteredList,
    setFullList,
    SearchField,
    setFilteredList,
    fullList,
    setSearchValue,
    triggerSearch,
  } = useSearch<REPORT>(
    ["reportId", "userApplicationId"],
    download
      ? "Enter File Number (example: 12334456)"
      : "Enter Report No (example: 1)",
  );

  useEffect(() => {
    const getDataList = async () => {
      try {
        const data = await fetchDataList(
          isArchive
            ? getAll && type === "admin" && isAdmin
              ? REPORT_LIST_ALL_ARCHIVED_API
              : isOrgAdmin
              ? REPORT_LIST_ORG_ARCHIVED_API
              : REPORT_LIST_ARCHIVED_API
            : getAll && type === "admin" && isAdmin
            ? REPORT_LIST_ALL_API
            : isOrgAdmin
            ? REPORT_LIST_ORG_ALL_API
            : REPORT_LIST_API,
          { product },
        );
        const newDataList = data.reportList.map((item: REPORT) => ({
          ...item,
          statusText: item.status.text,
          creationTime:
            formatDate(item.createdAt) + " " + formatTime(item.createdAt),
        }));
        setFullList(newDataList);
      } catch (error) {
        console.error("Failed to fetch report list:", error);
      }
    };
    getDataList();

    /*
      const webSocketService = new WebsocketService();
      webSocketService.connectReportSocket(, handleReportUpdate);
  
      return () => {
        if (WebsocketService.reportSocket) {
          WebsocketService.reportSocket.close();
        }
      };
    */
  }, [location, product]);

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
    const query = new URLSearchParams(hash.split("?")[1]);
    const reportName = query.get("s");
    if (reportName) {
      setSearchValue(reportName);
      triggerSearch(reportName);
    }
  }, [hash]);

  useEffect(() => {
    const connectWebSockets = () => {
      websocketServicesRef.current.forEach((wsService) =>
        wsService.closeReportSocket(),
      );
      websocketServicesRef.current = [];

      const newActiveConnections = [];
      const connectedAppIds = new Set();

      try {
        debouncedList.forEach((report) => {
          const userApplicationId = report.applicationId._id;

          if (!connectedAppIds.has(userApplicationId)) {
            // Check that the report has status.percent < 100
            const hasPendingStatus = report.status.percent < 100 || !report.status.validated;

            if (hasPendingStatus) {
              const websocketService = new WebsocketService();
              websocketService.connectReportSocket(
                userApplicationId,
                handleReportUpdate,
              );
              newActiveConnections.push(websocketService);
              connectedAppIds.add(userApplicationId);
            } else {
              //console.log("Skipping websocket connection for report with ID:", userApplicationId);
            }
          }
        });

        websocketServicesRef.current = newActiveConnections;
        console.log(
          "Count of active report WebSocket connections",
          websocketServicesRef.current.length,
        );
      } catch (e) {
        console.error("Error connecting to websocket:", e);
      }
    };

    if (debouncedList.length > 0) {
      connectWebSockets();
    }

    return () => {
      try {
        websocketServicesRef.current.forEach((websocketService) => {
          websocketService.closeReportSocket();
        });
        console.log(
          "Closing of report ws --- ",
          websocketServicesRef.current.length,
        );
      } catch (e) {
        console.error("Error closing websocket connections:", e);
      }
    };
  }, [debouncedList]);

  /*
      const handleReportUpdate = (message) => {
        //console.log('WebSocket message received:', message);
    
        let reportId = message.reportId;
    
        try {
          const updatedList = filteredList.map((report: REPORT) => {
            if (report.status) {
              if (report.id === reportId) {
                //console.log("Report Matched", report);
                report.statusText = message.status.text;
              }
            }
            return report;
          });
    
          setFullList(updatedList);
        } catch (e) {
          console.error("Error updating report status:", e);
        }
      };
      */

  const handleReportUpdate = (message) => {
    try {
      let reportId = message.reportId;
      console.log("WebSocket message received:", message);

      const updatedList = debouncedList.map((report: REPORT) => {
        if (report.status) {
          if (report.id === reportId) {
            //console.log("Report Matched", report);
            report.statusText = message.status.text;
            if (message.status.validated) {
              // refresh the page
              window.location.reload();
            }
          }
        }
        return report;
      });

      setFilteredList(updatedList);

      // Set full list to updated value but keep the rest of the list the same
      setFullList(
        fullList.map((report) => {
          if (report.id === reportId) {
            report.statusText = message.status.text;
          }
          return report;
        }),
      );
    } catch (e) {
      console.error("Error updating report status:", e);
    }
  };
  const handleDownload = async (id: string, name: string, orgId: string) => {
    try {
      const response = await sendRequest(
        REPORT_DOWNLOAD_API,
        "POST",
        {
          product,
          id,
          ...(isAdmin ? { orgId: orgId } : {}),
        },
        true,
        isAdmin,
        false,
      );
      if (response.status === 200) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name + ".pdf";
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
          {"Report Download Failed: "}
          {error instanceof Error ? error.message : "Internal Error"}
        </span>,
      );
    } finally {
      setOkFunction(handleOk);
      setCancelFunction(undefined);
      openModal();
    }
  };

  const handleValidate = (id: string, name: string) => {
    setMessage(
      <Box>
        Are you sure you want to validate report{" "}
        <span className="text-blue-500">{name}</span>?
      </Box>,
    );
    setOkFunction(() => () => handleValidateOk(id));
    setCancelFunction(handleCancel);
    openModal();
  };

  const handleValidateOk = async (id: string) => {
    try {
      const response = await sendRequest(
        REPORT_VALIDATE_API,
        "POST",
        {
          product: product,
          id: id,
        },
        true,
      );
      if (response.status === 200) {
        setMessage(<span className="font-bold">Report Validated</span>);
        setOkFunction(handleOkReload);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setMessage(
        <span>
          {"Report Validate Failed: "}
          {error instanceof Error ? error.message : "Internal Error"}
        </span>,
      );
      setOkFunction(handleOk);
    } finally {
      setCancelFunction(undefined);
      openModal();
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
      unarchive ? REPORT_UNARCHIVE_API : REPORT_ARCHIVE_API,
      { product, id },
      unarchive,
      "Report",
      setMessage,
      setOkFunction,
      setCancelFunction,
      handleOk,
      handleOkReload,
      () =>
        handleOkRedirect(`${getProductUrl(product)}${OVERVIEW_REPORT_PATH}`),
      openModal,
    );
  };

  const sortedReportList = () => {
    return sortArray([...filteredList], sortConfig);
  };

  const columns: GridColDef[] = [
    { field: "reportId", headerName: "Report", flex: 1 },
    { field: "userApplicationId", headerName: "File No.", flex: 1 },
    { field: "reportType", headerName: "Type", flex: 1 },
    { field: "creationTime", headerName: "Creation Time", flex: 1 },
    {
      field: "statusText",
      headerName: "Report Status",
      flex: 1,
      renderCell: (params) => {
        let tooltipTitle = <></>;

        if (params.value.toLowerCase() === "waiting for validation") {
          tooltipTitle = (
            <>
              We are working hard to cross-check the data. Please check back
              after 48 hours. The status will say "report completed" once the
              report is validated and completed.
            </>
          );
        } else if (params.value.toLowerCase() === "report generation failed") {
          tooltipTitle = (
            <span>
              Sorry, report generation failed. Please retry to generate the
              report later. If the issue persists, please{" "}
              <Link
                className="text-sky-400 underline"
                to="mailto: customersupport@finquantuminc.com"
                target="_blank"
                rel="noopener"
              >
                contact customer support
              </Link>
              .
            </span>
          );
        }

        return (
          <Box style={{ display: "flex", alignItems: "center" }}>
            <span>{params.value}</span>
            {(params.value.toLowerCase() === "waiting for validation" ||
              params.value.toLowerCase() === "report generation failed") && (
              <Tooltip className="h-fit" title={tooltipTitle}>
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
    ...(download
      ? [
          {
            field: "download",
            headerName: "Download",
            sortable: false,
            renderCell: (param) => (
              <ListItemIcon className="cursor-pointer align-middle pl-3">
                {(param.row.status.validated ||
                  (isAdmin && type === "admin")) ? (
                  <Download
                    onClick={() => {
                      handleDownload(
                        param.row.id,
                        param.row.reportId,
                        param.row.applicationId.orgId,
                      );
                    }}
                  />
                ) : (
                  <AccessTime />
                )}
              </ListItemIcon>
            ),
          },
        ]
      : []),
    ...(type === "admin"
      ? [
          {
            field: "validate",
            headerName: "Validate",
            sortable: false,
            renderCell: (param) => {
              return (
                <ListItemIcon className="cursor-pointer align-middle pl-3">
                  {param.row.status.finished ? (
                    param.row.status.validated ? (
                      <ThumbUp />
                    ) : (
                      <Check
                        onClick={() =>
                          handleValidate(
                            param.row.id,
                            param.row.userApplicationName,
                          )
                        }
                      />
                    )
                  ) : (
                    <></>
                  )}
                </ListItemIcon>
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
                          handleArchive(param.row.id, param.row.reportId, true)
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
                          handleArchive(param.row.id, param.row.reportId, false)
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
          rows={sortedReportList()}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25, page: 0 },
            },
          }}
          localeText={{ noRowsLabel: "No report found" }}
          getRowHeight={() => "auto"}
          sx={{
            [`& .${gridClasses.cell}`]: {
              py: 2,
              alignSelf: "center",
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default ReportList;
