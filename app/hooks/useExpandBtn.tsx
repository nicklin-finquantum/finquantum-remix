import React, { useReducer } from "react";
import { ChevronDownIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";

interface UseExpandBtnResult {
  isExpanded: boolean;
  expandBtn: React.ReactNode;
}

const useExpandBtn = (): UseExpandBtnResult => {
  const [isExpanded, toggleExpand] = useReducer(
    (isExpanded) => !isExpanded,
    true,
  );

  const expandBtn = (
    <Box className="cursor-pointer px-4" onClick={toggleExpand}>
      {isExpanded ? (
        <ChevronDownIcon className="icon" />
      ) : (
        <ChevronLeftIcon className="icon" />
      )}
    </Box>
  );

  return {
    isExpanded,
    expandBtn,
  };
};

export default useExpandBtn;
