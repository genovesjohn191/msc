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
  private _serverId: string;

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

  /**
   * Sets the server id based on the provided string
   * @param serverId Server id to be set
   */
  public setServerId(serverId: string): void {
    this._serverId = serverId;
  }

  /**
   * Returns the server id
   */
  public getServerId(): string {
    return this._serverId;
  }
}
