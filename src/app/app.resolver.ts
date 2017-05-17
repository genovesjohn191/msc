/** Resolvers */
import { ServersResolver } from './features/servers/servers.resolver';
import { ServerResolver } from './features/servers/server/server.resolver';

/** An array of services to resolve routes with data */
export const APP_RESOLVER_PROVIDERS = [
  ServerResolver,
  ServersResolver,
];
