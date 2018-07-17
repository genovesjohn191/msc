import {
  ServerCreateType,
  ServerCreateDetails
} from '../../models';
import { FormGroup } from '@angular/forms';

export abstract class ServerCreateDetailsBase {

  /**
   * Returns the specific creation type of the server
   */
  public abstract getCreationType(): ServerCreateType;

  /**
   * Returns the creation inputs of the server
   */
  public abstract getCreationInputs(): ServerCreateDetails;

  /**
   * Returns the creation form group including form fields
   */
  public abstract getCreationForm(): FormGroup;
}
