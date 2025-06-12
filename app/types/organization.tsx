export type ORGANIZATION_FORM = {
  name: string;
};

export type ORGANIZATION = ORGANIZATION_FORM & {
  id: string;
  createdAt: string;
};
