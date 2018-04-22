// TODO: This is just a temporary model
// Will update once the API was finalized

export class ServerHidsOptions {
  public serviceVariants: string[];
  public protectionLevels: string[];
  public policyTemplates: string[];

  constructor() {
    this.serviceVariants = undefined;
    this.protectionLevels = undefined;
    this.policyTemplates = undefined;
  }
}
