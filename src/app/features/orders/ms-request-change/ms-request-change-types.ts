export type MsCloudHealthResources = {
  name: string;
  type: string;
  subscription: string;
  resourceGroup: string;
  action: string;
}

export type MsRequestChangeProperties = {
  type: string;
  complexity: string;
  phoneConfirmationRequired: boolean;
  customerReferenceNumber: string;
  resources?: MsCloudHealthResources[];
  moduleName?: string;
  moduleId?: string;
  resourceGroup?: string;
  category?: string
  resourceIdentifiers?: string[];
  requestDescription?: string;
}