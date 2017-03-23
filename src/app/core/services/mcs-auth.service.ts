import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

/**
 * User Type Enumeration
 */
export enum UserTypeEnum {
  None = 0,
  User = 1,
  Admin = 2
}

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
  private _userType: UserTypeEnum;
  public get userType(): UserTypeEnum {
    return this._userType;
  }

  constructor() {
    this._userName = 'Arrian';
    this._userType = UserTypeEnum.Admin;
  }
}
