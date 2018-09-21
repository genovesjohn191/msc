import { FormGroup } from '@angular/forms';

export abstract class ServerCreateDetailsBase<T> {

  /**
   * Returns the creation inputs of the server
   */
  public abstract getCreationInputs(): T;

  /**
   * Returns the creation form group including form fields
   */
  public abstract getCreationForm(): FormGroup;
}
