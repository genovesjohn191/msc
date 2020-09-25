export enum RouteCategory {
  None,
  Dashboard,
  LaunchPad,
  Compute,
  Colocation,
  Network,
  Storage,
  MakeAChange,
  Orders,
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
};
