import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { McsServer } from '@app/models';

@Injectable()
export class ServerService {
  private _serverDetails = new BehaviorSubject<McsServer>(null);
  private _serverId: string;

  /**
   * Returns the selected server as an observable
   */
  public getServerDetails(): Observable<McsServer> {
    return this._serverDetails.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  /**
   * Set the selected server instance including the resource
   * @param server Server to be selected
   */
  public setServerDetails(serverDetails: McsServer): void {
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
