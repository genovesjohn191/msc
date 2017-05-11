import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { McsUserType } from '../enumerations/mcs-user-type.enum';

@Injectable()
export class McsAuthService {
  /**
   * GET: User Name
   */
  private _userName: string;
  public get userName(): string {
    return this._userName;
  }

  /**
   * GET: User Type(User, Admin)
   */
  private _userType: McsUserType;
  public get userType(): McsUserType {
    return this._userType;
  }

  constructor() {
    this._userName = 'Arrian';
    this._userType = McsUserType.Admin;
  }
}
