import {
  Injectable,
  isDevMode
} from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import {
  isNullOrEmpty,
  isJson
} from '@app/utilities';
import { CoreConfig } from '../core.config';
import { McsPlatformService } from '../services/mcs-platform.service';
let cryptoJS = require('crypto-js');

export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Lax' | 'Strict' | 'None';
}

@Injectable()
export class McsCookieService {

  /**
   * Returns true if the cookie should be secured
   */
  public get secured(): boolean {
    return !isDevMode();
  }

  constructor(
    private _cookieService: CookieService,
    private _coreConfig: CoreConfig,
    private _platformService: McsPlatformService
  ) { }

  /**
   * Set the cookie item as encrypted content
   * @param key Key of the cookie
   * @param value Value of the cookie
   * @param options Options for the cookie
   */
  public setEncryptedItem<T>(
    key: string,
    value: T,
    options: CookieOptions = { secure: true, sameSite: 'None' }
  ): void {
    // Encrypt the value
    let encrypted: string;
    let securedCookieOptions: CookieOptions = options;
    if (this.secured) {
      securedCookieOptions.secure = this.secured;
      securedCookieOptions.sameSite = 'None';
    }

    try {
      if (isJson(value)) {
        encrypted = cryptoJS.AES.encrypt(
          JSON.stringify(value),
          this._coreConfig.enryptionKey);
      } else {
        encrypted = cryptoJS.AES.encrypt(value, this._coreConfig.enryptionKey);
      }
    } catch (error) {
      // Set the normal cookie content when conversion to UTF has error
      this.setItem(key, value, securedCookieOptions);
      return;
    }

    // Save the encrypted data to cookie
    this._setCookie(key, encrypted.toString(), this._getCookieOptions(securedCookieOptions));
  }

  /**
   * Get the encrypted cookie and returns the decrypted content
   * @param key Key of the cookie to decrypt
   */
  public getEncryptedItem<T>(key: string): T {
    let decryptedData: any;
    let cookieData = this._cookieService.get(key);
    if (isNullOrEmpty(cookieData)) { return undefined; }

    try {
      // Decrypt the cookie content as object
      let bytes = cryptoJS.AES.decrypt(
        cookieData.toString(),
        this._coreConfig.enryptionKey);

      if (isJson(bytes)) {
        decryptedData = JSON.parse(bytes.toString(cryptoJS.enc.Utf8));
      } else {
        decryptedData = bytes.toString(cryptoJS.enc.Utf8);
      }
    } catch (error) {
      // Get the normal cookie content when conversion to UTF has error
      decryptedData = this.getItem(key);
    }
    return decryptedData as T;
  }

  /**
   * Set the cookie item as string
   * @param key Key of the cookie
   * @param value Value of the cookie
   * @param options Options for the cookie
   */
  public setItem<T>(
    key: string,
    value: T,
    options: CookieOptions = { secure: true, sameSite: 'None' }
  ): void {
    let securedCookieOptions: CookieOptions = options;
    securedCookieOptions.secure = this.secured;
    let objectValue = isJson(value) ? JSON.stringify(value) : value;
    let stringValue = isNullOrEmpty(objectValue) ? '' : objectValue.toString();

    // Set the content to the cookie
    this._setCookie(key, stringValue, this._getCookieOptions(securedCookieOptions));
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
  public removeItem(key: string, options: CookieOptions = { path: '/' }): void {
    this._cookieService.delete(key, options.path, options.domain);
  }

  /**
   * Returns the cookie options based on the platform
   * @param cookieOptions Cookie Option to set
   */
  private _getCookieOptions(cookieOptions: CookieOptions): CookieOptions {
    if (isNullOrEmpty(cookieOptions)) { return undefined; }
    // We need to always set the expiry to undefined
    // when it comes to IE because in IE,
    // the cookie will expire immediately as soon as it is set.
    if (this._platformService.TRIDENT) {
      cookieOptions.domain = undefined;
      cookieOptions.expires = undefined;
    }
    return cookieOptions;
  }

  private _setCookie(
    key: string,
    value: string,
    options: CookieOptions = { expires: undefined, path: undefined, domain: undefined, secure: true, sameSite: 'None', }
  ) {
    this._cookieService.set(key, value, options.expires, options.path, options.domain, options.secure, options.sameSite);
  }
}
