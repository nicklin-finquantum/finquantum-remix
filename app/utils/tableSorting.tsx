interface SortConfig {
  key: string;
  direction: "ascending" | "descending";
}

const getNestedValue = (obj: any, key: string) => {
  return key.split(".").reduce((o, i) => (o ? o[i] : null), obj);
};

const sortArray = (array: any[], sortConfig: SortConfig | null) => {
  if (sortConfig !== null) {
    return array.sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }
  return array;
};

const requestSort = (sortConfig: SortConfig | null, key: string) => {
  let direction: "ascending" | "descending" = "ascending";
  if (
    sortConfig &&
    sortConfig.key === key &&
    sortConfig.direction === "ascending"
  ) {
    direction = "descending";
  }
  return { key, direction };
};

const getSortIcon = (
  key: string,
  sortConfig: SortConfig | null,
  ArrowDownIcon: any,
  ArrowUpIcon: any,
) => {
  if (sortConfig?.key === key) {
    return sortConfig.direction === "ascending" ? (
      <ArrowUpIcon className="icon" />
    ) : (
      <ArrowDownIcon className="icon" />
    );
  }
  return <ArrowDownIcon className="icon" />;
};

export { SortConfig, getNestedValue, sortArray, requestSort, getSortIcon };
