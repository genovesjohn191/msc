export enum RouteCategory {
  None,
  Compute,
  Colocation,
  Network,
  Storage
}

export const routeCategoryText = {
  [RouteCategory.None]: 'None',
  [RouteCategory.Compute]: 'Compute',
  [RouteCategory.Colocation]: 'Colocation',
  [RouteCategory.Network]: 'Network',
  [RouteCategory.Storage]: 'Storage'
};
