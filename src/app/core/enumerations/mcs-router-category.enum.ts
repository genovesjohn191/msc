export enum McsRouteCategory {
  None,
  Compute,
  Colocation,
  Network,
  Storage
}

export const mcsRouteCategoryText = {
  [McsRouteCategory.None]: 'None',
  [McsRouteCategory.Compute]: 'Compute',
  [McsRouteCategory.Colocation]: 'Colocation',
  [McsRouteCategory.Network]: 'Network',
  [McsRouteCategory.Storage]: 'Storage'
};
