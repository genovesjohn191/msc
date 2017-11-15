import { ServerStorageSummary } from './server-storage-summary';

export class ServerResourceSummary {
  public id: string;
  public name: string;
  public vApp: string;
  public storage: ServerStorageSummary;
}
