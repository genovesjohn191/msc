// TODO: This is just a temporary model
// Will update once the API was finalized

/**
 * @deprecated Use the line item type of order instead
 */
export class McsServerSqlOptions {
  public versions: string[];
  public editions: string[];
  public architectures: string[];

  constructor() {
    this.versions = undefined;
    this.editions = undefined;
    this.architectures = undefined;
  }
}
