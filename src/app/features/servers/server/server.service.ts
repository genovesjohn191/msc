import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ServerDetails } from './server-details';

@Injectable()
export class ServerService {
  private _serverDetails = new BehaviorSubject<ServerDetails>(null);
  private _serverId: string;

  /**
   * Returns the selected server as an observable
   */
  public getServerDetails(): Observable<ServerDetails> {
    return this._serverDetails.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  /**
   * Set the selected server instance including the resource
   * @param server Server to be selected
   */
  public setServerDetails(serverDetails: ServerDetails): void {
    this._serverDetails.next(serverDetails);
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
