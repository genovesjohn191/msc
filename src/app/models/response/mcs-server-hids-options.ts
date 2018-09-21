// TODO: This is just a temporary model
// Will update once the API was finalized

/**
 * @deprecated Use the line item type of order instead
 */
export class McsServerHidsOptions {
  public serviceVariants: string[];
  public protectionLevels: string[];
  public policyTemplates: string[];

  constructor() {
    this.serviceVariants = undefined;
    this.protectionLevels = undefined;
    this.policyTemplates = undefined;
  }
}
