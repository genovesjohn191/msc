import {
  RouteKey,
  RouteCategory,
  McsFeatureFlag,
  McsPermission
} from '@app/models';

export interface SubMenuRouteDetails {
  routeKey: RouteKey;
  featureFlag: string[];
  permission: string[];
}

export type MenuRouteMap = Map<RouteCategory, SubMenuRouteDetails[]>;

export const menuRouteMap: MenuRouteMap = new Map();

// Order of Submenu matters, first one would be the default
menuRouteMap.set(RouteCategory.Compute, [
  {
    routeKey: RouteKey.Servers,
    featureFlag: [],
    permission: [McsPermission.CloudVmAccess, McsPermission.DedicatedVmAccess]
  },
  {
    routeKey: RouteKey.Media,
    featureFlag: [McsFeatureFlag.MediaCatalog],
    permission: [McsPermission.TemplateView, McsPermission.CatalogView]
  }
]);

menuRouteMap.set(RouteCategory.Network, [
  {
    routeKey: RouteKey.Firewalls,
    featureFlag: [],
    permission: [McsPermission.FirewallConfigurationView]
  },
  {
    routeKey: RouteKey.Internet,
    featureFlag: [McsFeatureFlag.InternetPortView],
    permission: [McsPermission.InternetView]
  }
]);

menuRouteMap.set(RouteCategory.Storage, [
  {
    routeKey: RouteKey.BackupAggregationTargets,
    featureFlag: [McsFeatureFlag.AddonBackupAggregationTargetView],
    permission: [McsPermission.TemplateView, McsPermission.CatalogView]
  }
]);
