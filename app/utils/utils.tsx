import type { ReactNode } from 'react';

import type { User } from '~/models/UserModel';
import OrgRole from '~/types/orgRole';
import { Product } from '~/types/product';
import type { StatusType } from '~/types/statusType';
import UserRole from '~/types/userRole';

import {
  AUTH_PATH,
  INCOME_ANALYSIS_URL,
  ME_API,
  MORTGAGE_ANALYSIS_URL,
  SIGNIN_URL,
  TOKEN_NAME,
} from './consts';

const buildQueryString = (params: Record<string, any>): string => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  });

  return query.toString();
};

const sendRequest = async (
  endpoint: string,
  method: string,
  data?: Record<any, any> | FormData,
  auth = false,
  admin = false,
  json = true,
): Promise<any> => {
  try {
    const accessToken = localStorage.getItem(TOKEN_NAME);
    if (auth && !accessToken) {
      return { status: 401 };
    }
    if (!window.location.href.includes(AUTH_PATH) && !accessToken) {
      window.location.pathname = SIGNIN_URL;
    }

    let response: Response | undefined;
    const baseUrl = import.meta.env.VITE_BACKEND_API_URL + endpoint;

    if (admin) data = { ...data, admin: admin };
    // Default headers
    const defaultHeaders: Record<string, string> =
      method === 'POST' && !(data instanceof FormData)
        ? {
          'Content-Type': 'application/json',
        }
        : {};

    const authHeaders: Record<string, string> = {
      'x-access-token': accessToken ?? '',
    };

    // Combine the default and extra headers
    const headers: Record<string, string> = {
      ...defaultHeaders,
      ...(auth ? authHeaders : {}),
    };

    // Prepare fetch options
    let fetchOptions: RequestInit = {
      method: method,
      headers: headers,
      credentials: 'include',
    };

    if (method === 'POST') {
      fetchOptions = {
        ...fetchOptions,
        body: data instanceof FormData ? data : JSON.stringify(data ?? {}),
      };
      response = await fetch(baseUrl, fetchOptions);
    } else if (method === 'GET') {
      const queryString = data ? `?${buildQueryString(data)}` : '';
      const fullUrl = baseUrl + queryString;
      response = await fetch(fullUrl, fetchOptions);
    } else {
      throw new Error(`Unsupported HTTP method: ${method}`);
    }

    // Check if the response is OK
    if (
      !response ||
      (response.status !== 200 &&
        response.status !== 400 &&
        response.status !== 401 &&
        response.status !== 403 &&
        response.status !== 500)
    ) {
      throw new Error('Network response was not ok');
    }

    const responseData = json ? await response.json() : response;
    if (json) responseData.status = response.status;
    return responseData;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getUser = async () => {
  const response = await sendRequest(ME_API, 'GET', {}, true);
  if (response.status === 200 && response.data && response.data.user) {
    return {
      id: response.data.user._id,
      organization: response.data.user.Organization,
      ...response.data.user,
    };
  }
  return null;
};

export const getResponseClassName = (responseStatus: StatusType) => {
  switch (responseStatus) {
    case 'success':
      return 'form-message-success';
    case 'error':
      return 'form-message-error';
    default:
      return 'form-message-default';
  }
};

export const formatPhoneNumber = (value: string) => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');

  // Format digits based on their length
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
      6,
      10,
    )}`;
  }
};

export const getProductUrl = (product: Product) => {
  if (product === Product.INCOME_ANALYSIS) {
    return INCOME_ANALYSIS_URL;
  } else {
    return MORTGAGE_ANALYSIS_URL;
  }
};

export const formatDate = (timestamp: string): string => {
  const dateObj = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  };
  return dateObj.toLocaleDateString('en-US', options);
};

export const formatTime = (timestamp: string) => {
  const dateObj = new Date(timestamp);
  const time =
    dateObj
      .toLocaleTimeString('en-US', { hour12: false })
      .split(':')
      .slice(0, 2)
      .join(':') +
    ':' +
    dateObj.getSeconds().toString().padStart(2, '0');
  return time;
};

export const isSuperAdmin = (user: User | null) => {
  return user && user?.role === UserRole.SUPERADMIN;
};

export const isOrgAdmin = (user: User | null) => {
  return user && user?.organization?.role === OrgRole.ADMIN;
};

// Fetch Data
export const fetchDataList = async (apiEndpoint: string, params: any) => {
  const response = await sendRequest(
    apiEndpoint,
    'GET',
    params,
    true,
    params.hasOrg,
  );
  if (response.status === 200 && response.data) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to fetch data');
};

// Handle Archive/Archive Confirmation
export const handleArchiveConfirmation = (
  name: string,
  unarchive: boolean,
  handleArchiveOk: (id: string, unarchive: boolean) => void,
  openModal: () => void,
  handleCancel: () => void,
  setMessage: (message: ReactNode) => void,
  setOkFunction: (fn: () => void) => void,
  setCancelFunction: (fn: () => void) => void,
) => {
  setMessage(
    <div className="space-y-2">
      <div>
        Are you sure you want to {unarchive ? 'unarchive' : 'archive'}{' '}
        <span className="text-blue-500">{name}</span>?
      </div>
      <div>
        All associated data will be {unarchive ? 'unarchived' : 'archived'} too.
      </div>
    </div>,
  );
  setOkFunction(() => () => handleArchiveOk(name, unarchive));
  setCancelFunction(handleCancel);
  openModal();
};

// Handle API Request for Archive/Archive
export const handleArchiveApiRequest = async (
  apiEndpoint: string,
  params: any,
  unarchive: boolean,
  type: string,
  setMessage: (message: ReactNode) => void,
  setOkFunction: (fn: () => void) => void,
  setCancelFunction: (fn: () => void) => void,
  handleOk: () => void,
  handleOkReload: () => void,
  handleOkRedirect: () => void,
  openModal: () => void,
) => {
  try {
    const response = await sendRequest(
      apiEndpoint,
      'POST',
      params,
      true,
      params.hasOrg,
    );
    if (response.status === 200) {
      setMessage(
        <span className="font-bold">{`${type} ${
          unarchive ? 'unarchived' : 'archived'
        } successfully`}</span>,
      );
      setOkFunction(unarchive ? handleOkRedirect : handleOkReload);
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    setMessage(
      <div className="space-y-2">
        <div className="font-bold">{`${type} ${
          unarchive ? 'unarchive' : 'archive'
        } Failed. `}</div>
        <div>{error instanceof Error ? error.message : 'Internal Error'}</div>
      </div>,
    );
    setOkFunction(handleOk);
  } finally {
    setCancelFunction(() => {});
    openModal();
  }
};

export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const inputValidation = (userInput: string): { isValid: boolean; errorMessage: string } => {
  // List of characters to disallow in user input
  // < > & " ' / `
  const forbiddenCharacters = /[<>&"'/`]/g;

  // Check if input contains forbidden characters
  const matches = userInput.match(forbiddenCharacters);
  const disallowedChars = matches ? Array.from(new Set(matches)).join(' ') : '';

  // Set an error message if the input is not valid
  const errorMessage = matches ? `Input contains disallowed characters: ${disallowedChars}` : '';

  return { isValid: !matches, errorMessage };
};
