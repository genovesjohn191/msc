import { McsFormGroupDirective } from '@app/shared';

export abstract class ServerCreateDetailsBase<T> {

  /**
   * Returns the creation inputs of the server
   */
  public abstract getCreationInputs(): T;

  /**
   * Returns the creation form group including form fields
   */
  public abstract getCreationForm(): McsFormGroupDirective;
}
