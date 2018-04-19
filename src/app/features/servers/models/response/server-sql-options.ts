// TODO: This is just a temporary model
// Will update once the API was finalized

export class ServerSqlOptions {
  public versions: string[];
  public editions: string[];
  public architectures: string[];

  constructor() {
    this.versions = undefined;
    this.editions = undefined;
    this.architectures = undefined;
  }
}
