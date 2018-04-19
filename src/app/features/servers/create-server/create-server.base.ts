import {
  ServerCreateType,
  ServerCreateDetails
} from '../models';
import { FormGroup } from '@angular/forms';

export abstract class CreateServerBase {

  /**
   * Returns the specific creation type of the server
   */
  public get creationType(): ServerCreateType {
    return this._creationType;
  }

  constructor(private _creationType: ServerCreateType) {
  }

  /**
   * Returns the creation inputs of the server
   */
  public abstract getCreationInputs(): ServerCreateDetails;

  /**
   * Returns the creation form group including form fields
   */
  public abstract getCreationForm(): FormGroup;
}
