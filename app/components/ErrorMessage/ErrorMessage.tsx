import { Box } from "@mui/material";

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => {
  return (
    <Box sx={{ color: "#d32f2f", fontSize: 12, marginLeft: 2 }}>{message}</Box>
  );
};

export default ErrorMessage;
