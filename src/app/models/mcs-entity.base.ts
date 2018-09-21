/**
 * Entity base for all the model entity
 */
export abstract class McsEntityBase {
  public id: string;

  constructor() {
    this.id = undefined;
  }
}
