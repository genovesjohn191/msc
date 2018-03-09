import {
  Injectable,
  isDevMode
} from '@angular/core';
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

  public secured: boolean = false;

  constructor(
    private _cookieService: CookieService,
    private _coreConfig: CoreConfig
  ) {
    this._setSecuredFlag();
  }

  /**
   * Set the cookie item as encrypted content
   * @param key Key of the cookie
   * @param value Value of the cookie
   * @param options Options for the cookie
   */
  public setEncryptedItem<T>(
    key: string,
    value: T,
    options: CookieOptions = { secure: true }
  ): void {
    // Encrypt the value
    let encrypted: string;
    let securedCookieOptions: CookieOptions = options;
    securedCookieOptions.secure = this.secured;

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
    this._cookieService.put(key, encrypted.toString(), securedCookieOptions);
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
    options: CookieOptions = { secure: true }
  ): void {
    let securedCookieOptions: CookieOptions = options;
    securedCookieOptions.secure = this.secured;
    let objectValue = isJson(value) ? JSON.stringify(value) : value;
    this._cookieService.put(key, objectValue.toString(), securedCookieOptions);
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

  /**
   * Sets the secured flag based on mode (Development/Production)
   */
  private _setSecuredFlag(): void {
    this.secured = !isDevMode;
  }
}
