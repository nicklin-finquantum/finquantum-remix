import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Product } from "../../types/product";
import ApplicationList from "../../components/Application/ApplicationList";
import ApplicantList from "../../components/Applicant/ApplicantList";
import ReportList from "../../components/Report/ReportList";
import { OverviewType } from "../../types/overviewType";

const tabConfig: {
  label: string;
  component: React.FC<{
    product: Product;
    type?: OverviewType;
    isArchive?: boolean;
    download?: boolean;
    getAll?: boolean;
  }>;
}[] = [
  { label: "Files", component: ApplicationList },
  { label: "Applicants", component: ApplicantList },
  { label: "Reports", component: ReportList },
];

const OverviewTabs: React.FC<{
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
  const { hash } = useLocation();

  const getTabIndexFromHash = (hash: string) => {
    // Remove query parameters from hash
    const cleanHash = hash.split("?")[0];
    const tabIndex = tabConfig.findIndex(
      (tab) => `#${tab.label.toLowerCase()}` === cleanHash,
    );
    return tabIndex === -1 ? 0 : tabIndex;
  };

  const [selectedTabIndex, setSelectedTabIndex] = React.useState<number>(
    getTabIndexFromHash(hash),
  );

  // Listen for hash changes to update the selected tab index
  useEffect(() => {
    setSelectedTabIndex(getTabIndexFromHash(hash));
  }, [hash]);

  const handleTabChange = (
    event: React.SyntheticEvent,
    newTabIndex: number,
  ) => {
    setSelectedTabIndex(newTabIndex);
    window.location.hash = `#${tabConfig[newTabIndex].label.toLowerCase()}`;
  };

  const SelectedTabContent = tabConfig[selectedTabIndex].component;

  return (
    <Box
      sx={{ width: "100%" }}
      className={isArchive ? "archive-tabs" : "overview-tabs"}
    >
      {isArchive && (
        <Box className="info-card">
          All files will be stored for 30 days from the date of creation.
        </Box>
      )}
      <Box sx={{ borderBottom: 1, borderColor: "Boxider" }}>
        <Tabs
          value={selectedTabIndex}
          onChange={handleTabChange}
          aria-label="Overview Tabs"
          variant="fullWidth"
        >
          {tabConfig.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </Box>
      <SelectedTabContent
        product={product}
        type={type}
        isArchive={isArchive}
        download={download}
        getAll={getAll}
      />
    </Box>
  );
};

export default OverviewTabs;
