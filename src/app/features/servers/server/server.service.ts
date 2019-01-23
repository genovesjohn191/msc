import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { McsServer } from '@app/models';

@Injectable()
export class ServerService {
  private _selectedServer = new BehaviorSubject<McsServer>(null);

  /**
   * Returns the selected server as an observable
   */
  public selectedServer(): Observable<McsServer> {
    return this._selectedServer.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  /**
   * Set the selected server instance
   * @param server Server to be selected
   */
  public setSelectedServer(server: McsServer): void {
    this._selectedServer.next(server);
  }
}
