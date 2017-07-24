import { Injectable } from '@angular/core';
import { AppState } from '../../app.service';
import { McsApiIdentity } from '../models/response/mcs-api-identity';
import { CoreDefinition } from '../core.definition';

@Injectable()
export class McsAuthenticationIdentity {

  private _firstName: string;
  public get firstName(): string {
    return this._firstName;
  }

  private _lastName: string;
  public get lastName(): string {
    return this._lastName;
  }

  private _userId: string;
  public get userId(): string {
    return this._userId;
  }

  private _email: string;
  public get email(): string {
    return this._email;
  }

  private _companyId: string;
  public get companyId(): string {
    return this._companyId;
  }

  private _companyName: string;
  public get companyName(): string {
    return this._companyName;
  }

  private _expiry: Date;
  public get expiry(): Date {
    return this._expiry;
  }

  private _roles: string[];
  public get roles(): string[] {
    return this._roles;
  }

  constructor(private _appState: AppState) { }

  /**
   * Apply the given identity to the service
   */
  public applyIdentity(): void {
    let identity = this._appState.get(CoreDefinition.APPSTATE_AUTH_IDENTITY);
    if (!identity) { return; }

    this._firstName = identity.firstName;
    this._lastName = identity.lastName;
    this._userId = identity.userId;
    this._email = identity.email;
    this._companyId = identity.companyId;
    this._companyName = identity.companyName;
    this._expiry = identity.expiry;
    this._roles = identity.roles;
  }
}
