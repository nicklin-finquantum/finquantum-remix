import { useEffect, useState } from "react";
import { Box, TextField, Typography } from "@mui/material";

const useSearch = <T,>(fields: (keyof T)[], placeholder: string) => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [fullList, setFullList] = useState<T[]>([]);
  const [filteredList, setFilteredList] = useState<T[]>([]);

  useEffect(() => {
    console.log("useEffect");
    const filterList = () => {
      const filtered = fullList.filter((item) =>
        fields.some((field) =>
          item[field]?.toString().toLowerCase().includes(searchValue),
        ),
      );
      setFilteredList(filtered);
    };

    filterList();
  }, [fullList, searchValue]);
  
  const triggerSearch = (value: string) => {
    setSearchValue(value.toLowerCase());
  };
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    setSearchValue(searchTerm.toLowerCase());
  };

  const SearchField = (
    <Box className="searchbar w-full flex mb-2">
      <Box
        className="flex min-w-17 input-label-secondary bg-blue-400 items-center p-2 rounded-lg"
        sx={{
          borderRadius: "4px 4px 4px 4px",
        }}
      >
        <Typography variant="body1" className="text-white">
          Search
        </Typography>
      </Box>
      <TextField
        value={searchValue}
        onChange={handleSearchChange}
        placeholder={placeholder}
        fullWidth
      />
    </Box>
  );

  return {
    searchValue,
    filteredList,
    setFilteredList,
    setFullList,
    SearchField,
    fullList,
    setSearchValue,
    triggerSearch
  };
};

export default useSearch;
