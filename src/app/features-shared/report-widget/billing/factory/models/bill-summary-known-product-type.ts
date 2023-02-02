export let billingKnownProductTypes = [
  {
    key: 'CSPLICENSES',
    friendlyName: 'CSP Licenses',
    aggregatedCustomTooltipFields: [],
    detailCustomTooltipFields: ['total', 'rrp', 'installedQuantity', 'termDuration', 'billingFrequency', 'discountOffRrp',
    'serviceSpecificManagementCharges', 'actualServiceSpecificManagementFee',
    'tenantName', 'initialDomain', 'primaryDomain',
    'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'],
    detailIncludeMinimumCommentNote: false,
    detailUseAzureDescription: true
  },
  {
    key: 'AZURESOFTWARESUBSCRIPTION',
    friendlyName: 'Software Subscriptions',
    aggregatedCustomTooltipFields: [],
    detailCustomTooltipFields: ['total', 'rrp', 'installedQuantity', 'discountOffRrp', 'linkManagementService',
    'managementChargesParent', 'serviceSpecificManagementCharges', 'actualServiceSpecificManagementFee',
    'tenantName', 'initialDomain', 'primaryDomain',
    'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'],
    detailIncludeMinimumCommentNote: false,
    detailUseAzureDescription: true
  },
  {
    key: 'AZUREVIRTUALDESKTOP',
    friendlyName: 'Azure Virtual Desktop',
    aggregatedCustomTooltipFields: [],
    detailCustomTooltipFields: ['total', 'minimumUserCommitment', 'userQuantity',
    'chargePerUserDollars', 'plan', 'linkedConsumptionService'],
    detailIncludeMinimumCommentNote: false,
    detailUseAzureDescription: true
  },
  {
    key: 'AZUREESSENTIALSCSP',
    friendlyName: 'Azure Essentials CSP',
    aggregatedCustomTooltipFields: [],
    detailCustomTooltipFields: ['total', 'minimumSpendCommitment', 'managementCharges',
    'tenantName', 'initialDomain', 'primaryDomain',
    'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'],
    detailIncludeMinimumCommentNote: true,
    detailUseAzureDescription: false
  },
  {
    key: 'AZUREESSENTIALSENTERPRISEAGREEMENT',
    friendlyName: 'Azure Essentials Enterprise Agreement',
    aggregatedCustomTooltipFields: [],
    detailCustomTooltipFields: ['total', 'minimumSpendCommitment', 'managementCharges',
    'tenantName', 'initialDomain', 'primaryDomain',
    'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'],
    detailIncludeMinimumCommentNote: true,
    detailUseAzureDescription: false
  },
  {
    key: 'MANAGEDAZURECSP',
    friendlyName: 'Managed Azure CSP',
    aggregatedCustomTooltipFields: [],
    detailCustomTooltipFields: ['total', 'minimumSpendCommitment', 'managementCharges',
    'tenantName', 'initialDomain', 'primaryDomain',
    'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'],
    detailIncludeMinimumCommentNote: true,
    detailUseAzureDescription: false
  },
  {
    key: 'MANAGEDAZUREENTERPRISEAGREEMENT',
    friendlyName: 'Managed Azure Enterprise Agreement',
    aggregatedCustomTooltipFields: [],
    detailCustomTooltipFields: ['total', 'minimumSpendCommitment', 'managementCharges',
    'tenantName', 'initialDomain', 'primaryDomain',
    'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'],
    detailIncludeMinimumCommentNote: false,
    detailUseAzureDescription: false
  },
  {
    key: 'AZUREPRODUCTCONSUMPTION',
    friendlyName: 'Azure Product Consumption',
    aggregatedCustomTooltipFields: ['total', 'rrp', 'usdPerUnit', 'microsoftChargeMonth', 'macquarieBillMonth'],
    detailCustomTooltipFields: ['total', 'usdPerUnit', 'discountOffRrp', 'linkManagementService',
    'managementChargesParent', 'serviceSpecificManagementCharges', 'actualServiceSpecificManagementFee',
    'tenantName', 'initialDomain', 'primaryDomain',
    'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'],
    detailIncludeMinimumCommentNote: false,
    detailUseAzureDescription: true
  },
  {
    key: 'AZUREPRODUCTCONSUMPTIONENTERPRISEAGREEMENT',
    friendlyName: 'Azure Product Consumption Enterprise Agreement',
    aggregatedCustomTooltipFields: [],
    detailCustomTooltipFields: ['total', 'rrp', 'discountOffRrp', 'linkManagementService',
    'managementChargesParent', 'serviceSpecificManagementCharges', 'actualServiceSpecificManagementFee',
    'tenantName', 'initialDomain', 'primaryDomain',
    'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'],
    detailIncludeMinimumCommentNote: false,
    detailUseAzureDescription: true
  },
  {
    key: 'AZURERESERVATION',
    friendlyName: 'Azure Reservation',
    aggregatedCustomTooltipFields: [],
    detailCustomTooltipFields: ['total','rrp', 'installedQuantity', 'discountOffRrp', 'linkManagementService',
    'managementChargesParent', 'serviceSpecificManagementCharges', 'actualServiceSpecificManagementFee',
    'tenantName', 'initialDomain', 'primaryDomain',
    'microsoftIdentifier', 'microsoftChargeMonth', 'macquarieBillMonth', 'serviceId'],
    detailIncludeMinimumCommentNote: false,
    detailUseAzureDescription: true,
  }
];
