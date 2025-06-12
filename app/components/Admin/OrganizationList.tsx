import { useEffect, useState } from "react";
import { formatDate, formatTime, sendRequest } from "../../utils/utils";
import { ADMIN_PATH, ORG_LIST_API, ORG_PATH } from "../../utils/consts"; // Assuming you have a DOWNLOAD_API constant
import { ORGANIZATION } from "../../types/organization";
import { Product } from "../../types/product";
import { Link, useLocation } from "react-router-dom";
import useExpandBtn from "../../hooks/useExpandBtn";
import {
  SortConfig,
  requestSort,
  sortArray,
  getSortIcon,
} from "../../utils/tableSorting";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";

const OrganizationList: React.FC<{ product: Product }> = ({ product }) => {
  const [organizationList, setOrganizationList] = useState<ORGANIZATION[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const { isExpanded, expandBtn } = useExpandBtn();
  const location = useLocation();

  useEffect(() => {
    const getDataList = async () => {
      const response = await sendRequest(
        ORG_LIST_API,
        "GET",
        { product: product },
        true,
      );
      if (
        response.status === 200 &&
        response.data &&
        response.data.organizationList
      ) {
        const newApplicantList = response.data.organizationList.map(
          (item: any) => ({
            id: item._id,
            ...item,
          }),
        );
        setOrganizationList(newApplicantList);
      }
    };
    getDataList();
  }, [location]);

  const sortedOrganizationList = () => {
    return sortArray([...organizationList], sortConfig);
  };

  const handleSort = (key: string) => {
    setSortConfig((prevSortConfig) => requestSort(prevSortConfig, key));
  };

  return (
    <Box className="card px-3 pt-6 pb-2.5 sm:px-7.5 xl:pb-1">
      <Box className="w-full flex justify-between">
        <h4 className="card-title">Organizations</h4>
        {expandBtn}
      </Box>
      {isExpanded && (
        <Box className="flex flex-col">
          <Box className="table-header !grid-cols-3">
            <Box className="table-header-container">
              <h5
                className="table-header-text flex hover:cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Name
                {getSortIcon("name", sortConfig, ArrowDownIcon, ArrowUpIcon)}
              </h5>
            </Box>
            <Box className="table-header-container">
              <h5
                className="table-header-text flex hover:cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                Creation Time
                {getSortIcon(
                  "createdAt",
                  sortConfig,
                  ArrowDownIcon,
                  ArrowUpIcon,
                )}
              </h5>
            </Box>
          </Box>

          {sortedOrganizationList().map((organization, key) => (
            <Link
              className={`table-row !grid-cols-3 table-row-hover ${
                key === organizationList.length - 1
                  ? ""
                  : "border-b border-stroke dark:border-strokedark"
              }`}
              key={key}
              to={`${ADMIN_PATH}${ORG_PATH}/${organization.id}`}
            >
              <Box className="table-item-container">
                <Typography className="table-item-text">
                  {organization.name}
                </Typography>
              </Box>
              <Box className="table-item-container">
                <Typography className="table-item-text">
                  {`${formatDate(organization.createdAt)} ${formatTime(
                    organization.createdAt,
                  )}`}
                </Typography>
              </Box>
            </Link>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default OrganizationList;
