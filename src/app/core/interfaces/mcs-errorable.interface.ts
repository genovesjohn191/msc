import { Observable } from 'rxjs';

export interface IMcsErrorable {
  errorsChange(): Observable<string[]>;
  setErrors(...errors: string[]): void;
}
