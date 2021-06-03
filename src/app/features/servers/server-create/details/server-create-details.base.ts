import { McsFormGroupDirective } from '@app/shared';
import { Os } from '@app/models';

export abstract class ServerCreateDetailsBase<T> {

  /**
   * Returns the creation inputs of the server
   */
  public abstract getCreationInputs(): T;

  /**
   * Returns the creation os of the server
   */
  public abstract getCreationOsType(): Os;

  /**
   * Returns the creation storage size of the server
   */
  public abstract getCreationStorageSize(): number;

  /**
   * Returns the creation form group including form fields
   */
  public abstract getCreationForm(): McsFormGroupDirective;
}