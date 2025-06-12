import React, { useEffect, useState } from "react";
import { useLocation, Link, NavLink } from "react-router-dom";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronDownIcon from "@mui/icons-material/ExpandMore";
import Logo from "../../images/logo/logo.svg";
import { Box, IconButton, useMediaQuery } from "@mui/material";
import {
  AddBoxOutlined,
  ChevronLeft,
  ChevronRight,
  CreateOutlined,
  DescriptionOutlined,
  FileDownloadOutlined,
  FolderOutlined,
  NoteAddOutlined,
  PersonOutline,
  SyncOutlined,
} from "@mui/icons-material";
import {
  ADD_APPLICATION_PATH,
  ADD_REPORT_PATH,
  APPLICATION_STATUS_UPDATE_PATH,
  ARCHIVE_PATH,
  DOWNLOAD_REPORT_PATH,
  EDIT_APPLICATION_PATH,
  MORTGAGE_ANALYSIS_URL,
  OVERVIEW_PATH,
} from "../../utils/consts";

// Updated sections array with defaultOpen property
const sections = [
  {
    id: "fileTab",
    text: "Files and Applicants",
    defaultOpen: true,
    items: [
      {
        path: `${MORTGAGE_ANALYSIS_URL}${ADD_APPLICATION_PATH}`,
        text: "Create",
        icon: <AddBoxOutlined />,
        className: "sidebar__create-btn", // Add class name
      },
      {
        path: `${MORTGAGE_ANALYSIS_URL}${EDIT_APPLICATION_PATH}`,
        text: "Modify",
        icon: <CreateOutlined />,
        className: "sidebar__modify-btn", // Add class name
      },
      {
        path: `${MORTGAGE_ANALYSIS_URL}${APPLICATION_STATUS_UPDATE_PATH}`,
        text: "Update Status",
        icon: <SyncOutlined />,
        className: "sidebar__update-status-btn", // Add class name
      },
    ],
  },
  {
    id: "reportTab",
    text: "FinQuantum Summary Reports",
    defaultOpen: true,
    items: [
      {
        path: `${MORTGAGE_ANALYSIS_URL}${ADD_REPORT_PATH}`,
        text: "Generate",
        icon: <NoteAddOutlined />,
        className: "sidebar__generate-report-btn", // Add class name
      },
      {
        path: `${MORTGAGE_ANALYSIS_URL}${DOWNLOAD_REPORT_PATH}`,
        text: "Download",
        icon: <FileDownloadOutlined />,
        className: "sidebar__download-report-btn", // Add class name
      },
    ],
  },
  {
    id: "overviewTab",
    text: "Overview",
    defaultOpen: true,
    items: [
      {
        path: `${MORTGAGE_ANALYSIS_URL}${OVERVIEW_PATH}#files`,
        text: "Files",
        icon: <FolderOutlined />,
        className: "sidebar__overview-files-btn", // Add class name
      },
      {
        path: `${MORTGAGE_ANALYSIS_URL}${OVERVIEW_PATH}#applicants`,
        text: "Applicants",
        icon: <PersonOutline />,
        className: "sidebar__overview-applicants-btn", // Add class name
      },
      {
        path: `${MORTGAGE_ANALYSIS_URL}${OVERVIEW_PATH}#reports`,
        text: "Reports",
        icon: <DescriptionOutlined />,
        className: "sidebar__overview-reports-btn", // Add class name
      },
    ],
  },
  {
    id: "archiveTab",
    text: "Archive",
    defaultOpen: false,
    items: [
      {
        path: `${MORTGAGE_ANALYSIS_URL}${ARCHIVE_PATH}#files`,
        text: "Files",
        icon: <FolderOutlined />,
        className: "sidebar__archive-files-btn", // Add class name
      },
      {
        path: `${MORTGAGE_ANALYSIS_URL}${ARCHIVE_PATH}#applicants`,
        text: "Applicants",
        icon: <PersonOutline />,
        className: "sidebar__archive-applicants-btn", // Add class name
      },
      {
        path: `${MORTGAGE_ANALYSIS_URL}${ARCHIVE_PATH}#reports`,
        text: "Reports",
        icon: <DescriptionOutlined />,
        className: "sidebar__archive-reports-btn", // Add class name
      },
    ],
  },
  {
    id: "decisionMatrixTab",
    text: "Decision Matrix / Recommendation (coming soon!)",
    defaultOpen: false,
    items: [],
    path: `${MORTGAGE_ANALYSIS_URL}/decision-matrix`,
    className: "sidebar__decision-matrix-btn", // Add class name
  },
];

const NestedList = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [expandedSections, setExpandedSections] = useState({});

  // Collapse the sidebar if the screen is small (mobile)
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile, setSidebarOpen]);

  // Initialize expandedSections state based on the defaultOpen value
  useEffect(() => {
    const initialExpandedState = sections.reduce((acc, section) => {
      acc[section.id] = section.defaultOpen;
      return acc;
    }, {});
    setExpandedSections(initialExpandedState);
  }, []);

  const toggleExpand = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleSectionClick = (sectionId) => {
    setExpandedSections((prevState) => ({
      ...prevState,
      [sectionId]: !prevState[sectionId],
    }));
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxWidth: sidebarOpen ? 280 : 80, // Adjust width based on sidebar state
        transition: "max-width 0.3s ease",
        bgcolor: "navbar.background",
        color: "navbar.text",
        position: "relative",
        "&:hover .expand-toggle": {
          opacity: 1, // Show the button on hover
        },
      }}
    >
      <Box className={`${sidebarOpen ? "flex" : ""}`}>
        <NavLink to="/">
          <Box className="flex justify-center p-5">
            <img
              src={Logo}
              alt="Logo"
              style={{ width: sidebarOpen ? "auto" : 40 }}
            />
          </Box>
        </NavLink>

        <Box className="m-auto flex justify-center">
          <IconButton
            onClick={toggleExpand}
            className="expand-toggle"
            sx={{
              alignSelf: sidebarOpen ? "flex-end" : "center",
              opacity: isMobile ? 1 : 0, // Hide the button on mobile view
            }}
          >
            {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </Box>
      </Box>

      <List
        className="SideNav overflow-y-scroll overflow-x-display shadow-2"
        sx={{
          flexGrow: 1, // Allow list to take up remaining height
        }}
        component="nav"
        aria-labelledby="nested-list-subheader"
      >
        <Box className="mt-5">
          {sections.map((section) => (
            <React.Fragment key={section.id}>
              <ListItemButton
                onClick={() => handleSectionClick(section.id)}
                sx={{ display: sidebarOpen ? "flex" : "none" }}
              >
                <ListItemText primary={section.text} />
                <ListItemIcon className="!flex justify-end">
                  {expandedSections[section.id] ? (
                    <ChevronDownIcon />
                  ) : (
                    <ChevronLeftIcon />
                  )}
                </ListItemIcon>
              </ListItemButton>

              {/* Conditionally render the subheaders based on the expanded state */}
              {expandedSections[section.id] && section.items.length > 0 && (
                <List component="div" disablePadding>
                  {section.items.map((item, index) => (
                    <Link to={item.path ? item.path : "#"} key={index}>
                      <ListItemButton
                        className={item.className}
                        selected={(location.pathname + location.hash).includes(
                          item.path,
                        )}
                        sx={{
                          paddingLeft: sidebarOpen ? 5 : 2,
                          paddingBlock: 0.5,
                        }}
                      >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText
                          primary={item.text}
                          sx={{ display: sidebarOpen ? "block" : "none" }}
                        />
                      </ListItemButton>
                    </Link>
                  ))}
                </List>
              )}
            </React.Fragment>
          ))}
        </Box>
      </List>
    </Box>
  );
};

export default NestedList;
