import { Injectable } from '@angular/core';
import {
  CookieService,
  CookieOptions
} from 'ngx-cookie';
import { CoreConfig } from '../core.config';
import {
  isNullOrEmpty,
  isJson
} from '../../utilities';
let cryptoJS = require('crypto-js');

@Injectable()
export class McsCookieService {

  constructor(
    private _cookieService: CookieService,
    private _coreConfig: CoreConfig
  ) { }

  /**
   * Set the cookie item as encrypted content
   * @param key Key of the cookie
   * @param value Value of the cookie
   * @param options Options for the cookie
   */
  public setEncryptedItem<T>(key: string, value: T, options?: CookieOptions): void {
    // Encrypt the value
    let encrypted: string;
    if (isJson(value)) {
      encrypted = cryptoJS.AES.encrypt(
        JSON.stringify(value),
        this._coreConfig.saltKey);
    } else {
      encrypted = cryptoJS.AES.encrypt(value, this._coreConfig.saltKey);
    }

    // Save the encrypted data to cookie
    this._cookieService.put(key, encrypted.toString(), options);
  }

  /**
   * Get the encrypted cookie and returns the decrypted content
   * @param key Key of the cookie to decrypt
   */
  public getEncryptedItem<T>(key: string): T {
    let cookieData = this._cookieService.get(key);
    if (isNullOrEmpty(cookieData)) { return undefined; }

    // Decrypt the cookie content as object
    let bytes = cryptoJS.AES.decrypt(
      cookieData.toString(),
      this._coreConfig.saltKey);

    let decryptedData: any;
    if (isJson(bytes)) {
      decryptedData = JSON.parse(bytes.toString(cryptoJS.enc.Utf8));
    } else {
      decryptedData = bytes.toString(cryptoJS.enc.Utf8);
    }

    return decryptedData as T;
  }

  /**
   * Set the cookie item as string
   * @param key Key of the cookie
   * @param value Value of the cookie
   * @param options Options for the cookie
   */
  public setItem<T>(key: string, value: T, options?: CookieOptions): void {
    let objectValue = isJson(value) ? JSON.stringify(value) : value;
    this._cookieService.put(key, objectValue.toString(), options);
  }

  /**
   * Get the cookie item as an object or string
   * @param key Key of the cookie
   */
  public getItem<T>(key: string): T {
    let cookieValue = this._cookieService.get(key);
    return isJson(cookieValue) ? JSON.parse(cookieValue) : cookieValue;
  }

  /**
   * Remove the corresponding item in the cookie
   * @param key Key of the cookie to removed
   * @param options Options of the cookie
   */
  public removeItem(key: string, options?: CookieOptions): void {
    this._cookieService.remove(key, options);
  }
}
