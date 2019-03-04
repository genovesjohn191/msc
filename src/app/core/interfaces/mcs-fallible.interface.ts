import { Observable } from 'rxjs';

export interface IMcsFallible {
  errorsChange(): Observable<string[]>;
  setErrors(...errors: string[]): void;
}
