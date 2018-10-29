import { Subject } from 'rxjs';

export interface McsEventHandler {
  eventResetSubject: Subject<void>;
  registerEvents(): void;
}
