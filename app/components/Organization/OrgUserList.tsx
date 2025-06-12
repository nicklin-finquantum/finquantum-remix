import React, { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Link, useLocation } from "react-router-dom";
import { Box, Typography } from "@mui/material";

import { ORG_PATH, ORG_USER_LIST_API, USER_PATH } from "../../utils/consts";
import { sendRequest } from "../../utils/utils";
import { USER } from "../../types/user";
import { Height, VerticalAlignCenter } from "@mui/icons-material";

const OrgUserList: React.FC = () => {
  const [rows, setRows] = useState<USER[]>([]);
  const location = useLocation();

  useEffect(() => {
    const getUserOrgUserList = async () => {
      try {
        const response = await sendRequest(ORG_USER_LIST_API, "GET", {}, true);
        if (
          response.status === 200 &&
          response.data &&
          response.data.userList
        ) {
          const newUserList = response.data.userList.map((user: any) => ({
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            role: user.organization?.role,
            email: user.email,
            organizationId: user.organization?.id,
          }));
          setRows(newUserList);
        }
      } catch (error) {
        console.error("Failed to fetch organization user list:", error);
      }
    };
    getUserOrgUserList();
  }, [location]);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    { field: "role", headerName: "Role", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
  ];

  return (
    <Box className="datagrid-container">
      <DataGrid
        scrollbarSize={4}
        rows={rows}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25, page: 0 },
          },
        }}
        columns={columns}
        localeText={{ noRowsLabel: "No Users found" }}
        autoHeight
      />
    </Box>
  );
};

export default OrgUserList;
