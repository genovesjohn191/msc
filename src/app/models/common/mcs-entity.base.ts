import { McsGuid } from '@app/core';
import { McsEntityStateBase } from './mcs-entity-state.base';

export abstract class McsEntityBase extends McsEntityStateBase {
  public id: string;

  constructor() {
    super();
    this.id = McsGuid.newGuid().toString();
  }
}
