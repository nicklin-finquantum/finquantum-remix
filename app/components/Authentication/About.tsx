import React from "react";
import SsoImg from "../../images/sso/SsoImg.svg";
import { Box } from "@mui/material";

const About: React.FC = () => {
  return (
    <Box className="hidden xl:block px-20">
      <span className="mt-30 inline-block">
        <img src={SsoImg} alt="SsoImg" />
      </span>
    </Box>
  );
};

export default About;
