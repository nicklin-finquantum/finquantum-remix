import React, { useEffect, useState } from "react";
import { Grid, Typography, Box } from "@mui/material";
import { checkOrgRole, sendRequest } from "../../utils/utils";
import { APPLICATION_STATISTICS_API } from "../../utils/consts";

import { Product } from "../../types/product";
import { useUser } from "../../hooks/useUser";

const ApplicationStatisticsTable = () => {
  const [statisticsData, setstatisticsData] = useState([]);
  const { user } = useUser();
  const isOrgAdmin = checkOrgRole(user);
  const orgId = user?.organization?.id;
  const userId = user?.id;

  useEffect(() => {
    const getDataList = async () => {
      const response = await sendRequest(
        APPLICATION_STATISTICS_API,
        "GET",
        {
          product: Product.MORTGAGE_ANALYSIS,
          userId: userId ?? user.id,
          orgId: orgId,
        },
        true,
        isOrgAdmin,
      );
      if (response.status === 200 && response.data) {
        try {
          interface ResponseData {
            [key: string]: {
              count: number;
              label: string;
            };
          }

          const newStats = Object.entries(response.data).map(
            ([key, { count, label }]: [string, ResponseData]) => {
              return {
                key: key,
                label: label,
                content: count,
              };
            },
          );
          setstatisticsData(newStats);
        } catch (e) {
          console.log("Couldnt fetch app data", e);
        }
      }
    };
    getDataList();
  }, []);

  return (
    <Box>
      <Grid container spacing={2}>
        {statisticsData.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Box
              border={1}
              padding={1}
              borderRadius={2}
              className="bg-blue-300"
            >
              <Box display="flex" justifyContent="left">
                <Typography variant="body1" fontWeight="bold">
                  {item.label}:
                </Typography>
                <Typography variant="body1" style={{ marginLeft: "0.25rem" }}>
                  {item.content}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ApplicationStatisticsTable;
