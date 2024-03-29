export enum RouteCategory {
  None,
  Dashboard,
  LaunchPad,
  LaunchPadNetworkDb,
  LaunchPadVlanDb,
  LaunchPadDashboard,
  Compute,
  Colocation,
  Network,
  Storage,
  MakeAChange,
  Orders,
  Azure,
  PlannedWork,
  Billing
}

export const routeCategoryText = {
  [RouteCategory.None]: 'None',
  [RouteCategory.Dashboard]: 'Dashboard',
  [RouteCategory.LaunchPad]: 'LaunchPad',
  [RouteCategory.Compute]: 'Compute',
  [RouteCategory.Colocation]: 'Colocation',
  [RouteCategory.Network]: 'Network',
  [RouteCategory.Storage]: 'Storage',
  [RouteCategory.MakeAChange]: 'MakeAChange',
  [RouteCategory.Azure]: 'Azure',
  [RouteCategory.PlannedWork]: 'PlannedWork',
  [RouteCategory.Billing]: 'Billing'
};
