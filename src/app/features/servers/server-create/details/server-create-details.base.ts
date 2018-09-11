import { FormGroup } from '@angular/forms';
import { ServerCreateType } from '../../models';

export abstract class ServerCreateDetailsBase<T> {

  /**
   * Returns the specific creation type of the server
   */
  public abstract getCreationType(): ServerCreateType;

  /**
   * Returns the creation inputs of the server
   */
  public abstract getCreationInputs(): T;

  /**
   * Returns the creation form group including form fields
   */
  public abstract getCreationForm(): FormGroup;
}
