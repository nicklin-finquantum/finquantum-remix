export const TOKEN_NAME = 'FINQUANTUM_TOKEN';

export const APPLICANT_PATH = '/applicant';
export const APPLICATION_PATH = '/application';
export const REPORT_PATH = '/report';
export const ORG_PATH = '/organization';
export const ADMIN_PATH = '/admin';
export const USER_PATH = '/user';
export const AUTH_PATH = '/auth';
export const SERVICE_PATH = '/service';
export const MANAGE_PATH = '/manage';
export const MEMERS_PATH = '/members';

export const ADD_APPLICATION_PATH = '/addApplication';
export const EDIT_APPLICATION_PATH = '/editApplication';
export const ASSIGN_APPLICATION_PATH = '/assignApplication';
export const ADD_APPLICANT_PATH = '/addApplicant';
export const EDIT_APPLICANT_PATH = '/editApplicant';
export const ADD_REPORT_PATH = '/addReport';
export const DOWNLOAD_REPORT_PATH = '/downloadReport';
export const ADD_FILE_PATH = '/addFile';
export const APPLICATION_STATUS_UPDATE_PATH = '/updateApplicationStatus';

export const OVERVIEW_PATH = '/overview';
export const OVERVIEW_APPLICATION_PATH = OVERVIEW_PATH + '#files';
export const OVERVIEW_APPLICANT_PATH = OVERVIEW_PATH + '#applicants';
export const OVERVIEW_REPORT_PATH = OVERVIEW_PATH + '#reports';
export const ARCHIVE_PATH = '/archive';

export const SIGNIN_URL = '/auth/signin';
export const SIGNUP_URL = '/auth/signup';
export const LOGOUT_URL = '/auth/logout';
export const CREATE_ORG_URL = '/organization/create';

export const INCOME_ANALYSIS_URL = '/incomeAnalysis';
export const INCOME_APPLICANT_URL = '/incomeAnalysis/applicant';
export const ADD_INCOME_APPLICANT_URL = '/incomeAnalysis/addApplicant';
export const ADD_INCOME_APPLICATION_URL = '/incomeAnalysis/addApplication';

export const MORTGAGE_ANALYSIS_URL = '/mortgageAnalysis';
export const MORTGAGE_APPLICANT_URL = '/mortgageAnalysis/applicant';
export const ADD_MORTGAGE_APPLICANT_URL = '/mortgageAnalysis/addApplicant';
export const ADD_MORTGAGE_APPLICATION_URL = '/mortgageAnalysis/addApplication';

export const ME_API = '/api/users/me';
export const USER_GET_API = '/api/users/get';
export const USER_DELETE_API = '/api/users/delete';
export const SIGNIN_API = '/api/users/signIn';
export const SIGNUP_API = '/api/users/signUp';
export const GENERATE_CODE_API = '/api/users/generateCode';
export const USER_GET_INVITES = '/api/users/getInvites';
export const USER_ACCEPT_INVITE = '/api/users/acceptInvite';
export const USER_DECLINE_INVITE = '/api/users/declineInvite';

export const ORG_CREATE_API = '/api/organizations/create';
export const ORG_GET_API = '/api/organizations/get';
export const ORG_USER_LIST_API = '/api/organizations/getUserList';
export const ORG_GET_STATUS_LIST_API = '/api/organizations/getStatusList';
export const ORG_LIST_API = '/api/organizations/list';
export const ORG_UPDATE_CUSTOM_STATUS_API = '/api/organizations/updateOrgCustomStatus';
export const ORG_GET_INVITES = '/api/organizations/getInvites';
export const ORG_INVITE_USER = '/api/organizations/inviteUser';
export const ORG_DELETE_INVITE = '/api/organizations/deleteInvite';

export const APPLICANT_CREATE_API = '/api/applicants/create';
export const APPLICANT_EDIT_API = '/api/applicants/edit';
export const APPLICANT_GET_API = '/api/applicants/get';
export const APPLICANT_LIST_API = '/api/applicants/list';
export const APPLICANT_LIST_ALL_API = '/api/applicants/listAll';
export const APPLICANT_LIST_ORG_ALL_API = '/api/applicants/listOrgAll';
export const APPLICANT_LIST_ARCHIVED_API = '/api/applicants/listArchived';
export const APPLICANT_LIST_ORG_ARCHIVED_API =
  '/api/applicants/listOrgArchived';
export const APPLICANT_LIST_ALL_ARCHIVED_API =
  '/api/applicants/listAllArchived';
export const APPLICANT_LIST_BY_APPLICATION_API =
  '/api/applicants/listByApplication';
export const APPLICANT_DELETE_API = '/api/applicants/delete';
export const APPLICANT_ARCHIVE_API = '/api/applicants/archive';
export const APPLICANT_UNARCHIVE_API = '/api/applicants/unarchive';

export const FILE_CREATE_API = '/api/files/create';
export const FILE_LIST_API = '/api/files/list';
export const FILE_DOWNLOAD_API = '/api/files/download';
export const FILE_DELETE_API = '/api/files/delete';

export const APPLICATION_CREATE_API = '/api/applications/create';
export const APPLICATION_EDIT_API = '/api/applications/edit';
export const APPLICATION_ASSIGN_API = '/api/applications/assign';
export const APPLICATION_GET_API = '/api/applications/get';
export const APPLICATION_LIST_API = '/api/applications/list';
export const APPLICATION_LIST_All_API = '/api/applications/listAll';
export const APPLICATION_LIST_ORG_ALL_API = '/api/applications/listOrgAll';
export const USER_APPLICATION_LIST_API =
  '/api/applications/listUserApplications';
export const APPLICATION_LIST_ARCHIVED_API = '/api/applications/listArchived';
export const APPLICATION_LIST_ORG_ARCHIVED_API =
  '/api/applications/listOrgArchived';
export const APPLICATION_LIST_ALL_ARCHIVED_API =
  '/api/applications/listAllArchived';
export const APPLICATION_LIST_BY_APPLICATION_API =
  '/api/applications/listByApplication';
export const APPLICATION_DOWNLOAD_API = '/api/applications/download';
export const APPLICATION_DELETE_API = '/api/applications/delete';
export const APPLICATION_STATISTICS_API = '/api/applications/statistics';
export const APPLICATION_ARCHIVE_API = '/api/applications/archive';
export const APPLICATION_UNARCHIVE_API = '/api/applications/unarchive';
export const APPLICATION_UPDATE_STATUS_API =
  '/api/applications/updateApplicationStatus';
export const APPLICATION_ROLLBACK_API = '/api/applications/rollback';

export const REPORT_CREATE_API = '/api/reports/create';
export const REPORT_EDIT_API = '/api/reports/edit';
export const REPORT_GET_API = '/api/reports/get';
export const REPORT_LIST_API = '/api/reports/list';
export const REPORT_LIST_ALL_API = '/api/reports/listAll';
export const REPORT_LIST_ORG_ALL_API = '/api/reports/listOrgAll';
export const REPORT_LIST_ARCHIVED_API = '/api/reports/listArchived';
export const REPORT_LIST_ORG_ARCHIVED_API = '/api/reports/listOrgArchived';
export const REPORT_LIST_ALL_ARCHIVED_API = '/api/reports/listAllArchived';
export const REPORT_LIST_BY_APPLICATION_API = '/api/reports/listByApplication';
export const REPORT_DOWNLOAD_API = '/api/reports/download';
export const REPORT_ARCHIVE_API = '/api/reports/archive';
export const REPORT_UNARCHIVE_API = '/api/reports/unarchive';
export const REPORT_VALIDATE_API = '/api/reports/validate';
