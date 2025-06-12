import React, { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";

import { checkOrgRole, fetchDataList } from "../../utils/utils";
import {
  APPLICATION_LIST_API,
  USER_APPLICATION_LIST_API,
} from "../../utils/consts";
import { Product } from "../../types/product";
import { useUser } from "../../hooks/useUser";
import OrgRole from "../../types/orgRole";

const ApplicationHomeTable: React.FC = () => {
  const [rows, setRows] = useState([]);
  const { user } = useUser();
  const isOrgAdmin = checkOrgRole(user);
  const orgId = user?.organization?.id;
  const userId = user?.id;

  useEffect(() => {
    const getDataList = async () => {
      try {
        const data = await fetchDataList(
          user.organization.role === OrgRole.ADMIN
            ? APPLICATION_LIST_API
            : USER_APPLICATION_LIST_API,
          {
            product: Product.MORTGAGE_ANALYSIS,
            userId: userId ?? user.id,
            ...(isOrgAdmin && { orgId }),
          },
        );
        setRows(data.applicationList);
        //console.log("data.applicationList", data.applicationList);
      } catch (error) {
        console.error("Failed to fetch application home list:", error);
      }
    };
    getDataList();
  }, []);

  const columns: GridColDef[] = [
    //{ field: "owner", headerName: "Owner", flex: 1 },
    { field: "userApplicationId", headerName: "File No.", flex: 1 },
    { field: "status", headerName: "Status", flex: 2 },
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
        localeText={{ noRowsLabel: "No file found" }}
      />
    </Box>
  );
};

export default ApplicationHomeTable;
