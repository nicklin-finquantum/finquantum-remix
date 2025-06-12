import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Menu,
  MenuItem,
  IconButton,
  Typography,
  ListItemIcon,
} from "@mui/material";
import {
  CorporateFare,
  ExitToApp,
  KeyboardArrowDown,
  SupervisedUserCircle,
} from "@mui/icons-material";

import { useUser } from "../../hooks/useUser";
import {
  ADMIN_PATH,
  MANAGE_PATH,
  MEMERS_PATH,
  ORG_PATH,
  SERVICE_PATH,
  TOKEN_NAME,
} from "../../utils/consts";
import { checkAdmin } from "../../utils/utils";

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { user } = useUser();
  const isAdmin = checkAdmin(user);

  const trigger = useRef(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setDropdownOpen(event.currentTarget);
  };

  const handleClose = () => {
    setDropdownOpen(null);
  };

  const handleSignout = () => {
    localStorage.removeItem(TOKEN_NAME);
    window.location.reload();
  };

  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (
        dropdownOpen &&
        !trigger.current?.contains(event.target as Node) &&
        !dropdownOpen.contains(event.target as Node)
      ) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [dropdownOpen]);

  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, []);

  return (
    <Box position="relative">
      <IconButton
        ref={trigger}
        onClick={handleClick}
        className="flex items-center gap-4"
        size="large"
        sx={{
          "&:hover": {
            backgroundColor: "transparent", // Remove hover background
          },
          padding: 0,
        }}
      >
        <Box display={{ xs: "none", lg: "block" }} textAlign="right">
          <Typography variant="h6" fontWeight="bold">
            {user?.firstName + " " + user?.lastName}
          </Typography>
        </Box>
        <KeyboardArrowDown />
      </IconButton>

      <Menu
        anchorEl={dropdownOpen}
        open={Boolean(dropdownOpen)}
        onClose={handleClose}
        PaperProps={{
          style: {
            marginTop: "4px",
            width: "200px",
          },
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem component={Link} to={ORG_PATH} onClick={handleClose}>
          <ListItemIcon>
            <CorporateFare fontSize="small" />
          </ListItemIcon>
          <Typography fontWeight="bold">Organization</Typography>
        </MenuItem>

        {/* Smaller items under Organization */}
        <Box pl={6}>
          <MenuItem
            component={Link}
            to={`${ORG_PATH}${MEMERS_PATH}`}
            onClick={handleClose}
          >
            <Typography variant="body2">Members</Typography>
          </MenuItem>
          <MenuItem
            component={Link}
            to={`${ORG_PATH}${MANAGE_PATH}`}
            onClick={handleClose}
          >
            <Typography variant="body2">Manage</Typography>
          </MenuItem>
        </Box>

        {isAdmin && (
          <>
            <MenuItem component={Box}>
              <ListItemIcon>
                <SupervisedUserCircle fontSize="small" />
              </ListItemIcon>
              <Typography fontWeight="bold">Admin</Typography>
            </MenuItem>

            {/* Smaller items under Admin */}
            <Box pl={6}>
              <MenuItem
                component={Link}
                to={`${ADMIN_PATH}${SERVICE_PATH}`}
                onClick={handleClose}
              >
                <Typography variant="body2">Service</Typography>
              </MenuItem>
              <MenuItem
                component={Link}
                to={`${ADMIN_PATH}/manage`}
                onClick={handleClose}
              >
                <Typography variant="body2">Manage</Typography>
              </MenuItem>
            </Box>
          </>
        )}

        <MenuItem onClick={handleSignout}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          <Typography fontWeight="bold">Log Out</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DropdownUser;
