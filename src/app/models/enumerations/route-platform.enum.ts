export enum RoutePlatform {
  Global,
  Private,
  Public,
  Hybrid
}

export const routePlatformText = {
  [RoutePlatform.Global]: 'Global',
  [RoutePlatform.Private]: 'Private',
  [RoutePlatform.Public]: 'Public',
  [RoutePlatform.Hybrid]: 'Hybrid'
};
