/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 *
 * This file is divided into 2 sections:
 *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.
 *   2. Application imports. Files imported after ZoneJS that should be loaded before your main
 *      file.
 *
 * The current setup is for so-called "evergreen" browsers; the last versions of browsers that
 * automatically update themselves. This includes Safari >= 10, Chrome >= 55 (including Opera),
 * Edge >= 13 on the desktop, and iOS 10 and Chrome on mobile.
 *
 * Learn more in https://angular.io/guide/browser-support
 */

/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/** IE10 and IE11 requires the following for NgClass support on SVG elements */
// import 'classlist.js';  // Run `npm install --save classlist.js`.

import 'web-animations-js'; // Run `npm install --save web-animations-js`.
/**
 * By default, zone.js will patch all possible macroTask and DomEvents
 * user can disable parts of macroTask/DomEvents patch by setting following flags
 * because those flags need to be set before `zone.js` being loaded, and webpack
 * will put import in the top of bundle, so user need to create a separate file
 * in this directory (for example: zone-flags.ts), and put the following flags
 * into that file, and then add the following code before importing zone.js.
 * import './zone-flags.ts';
 *
 * The flags allowed in zone-flags.ts are listed here.
 *
 * The following flags will work for all browsers.
 *
 * (window as any).__Zone_disable_requestAnimationFrame = true; // disable patch requestAnimationFrame
 * (window as any).__Zone_disable_on_property = true; // disable patch onProperty such as onclick
 * (window as any).__zone_symbol__UNPATCHED_EVENTS = ['scroll', 'mousemove']; // disable patch specified eventNames
 *
 *  in IE/Edge developer tools, the addEventListener will also be wrapped by zone.js
 *  with the following flag, it will bypass `zone.js` patch for IE/Edge
 *
 *  (window as any).__Zone_enable_cross_context_check = true;
 *
 */
/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */
import 'zone.js/dist/zone'; // Included with Angular CLI.

import { KeyboardKey } from '@app/utilities';

/**
 * Web Animations `@angular/platform-browser/animations`
 * Only required if AnimationBuilder is used within the application and using IE/Edge or Safari.
 * Standard animation support in Angular DOES NOT require any polyfills (as of Angular 6.0).
 */
/***************************************************************************************************
 * APPLICATION IMPORTS
 */


/***************************************************************************************************
 * GLOBAL DECLARATIONS FOR EXTENSIONS
 */
declare global {
  interface KeyboardEvent {
    keyboardKey(): KeyboardKey;
  }

  interface Array<T> {
    distinct(selector?: (item: T) => string | number): T[];
  }

  interface String {
    toColor(): string;
    toHex(): string;
    toRGB(): string;
    toRandomGreyHex(): string;
    toDefinedGreyHex(index: number): string;
    truncate(truncateLength: number): string;
  }
}

/***************************************************************************************************
 * Keyboard Extensions
 */
KeyboardEvent.prototype.keyboardKey = function () {
  // tslint:disable-next-line: deprecation
  return (this as KeyboardEvent).keyCode as KeyboardKey ||
    KeyboardKey[(this as KeyboardEvent).key];
}

/***************************************************************************************************
 * Array Extensions
 */
Array.prototype.distinct = function (selector?: (item: any) => string | number) {
  if (this.length === 0) return this;
  let uniqueKeys = [...new Set(this.map(selector))];
  return uniqueKeys.map(uniqueKey => this.find(item => selector(item) === uniqueKey));
}

/***************************************************************************************************
 * String Extensions
 */
String.prototype.truncate = function (truncateLength: number) {
  if (this.length === 0) return this;
  let exceeded = this.length > truncateLength;

  return exceeded ?
    `${this.substring(0, truncateLength)}...` :
    this;
}

String.prototype.toDefinedGreyHex = (index: number) => {
  let definedColors = [
    '#8F8F8F', '#E1E1E1', '#D4D4D4',
    '#676767', '#A5A5A5', '#808080',
    '#949494', '#7B7B7B', '#979797',
    '#7D7D7D', '#616161', '#757575',
    '#A9A9A9', '#909090', '#8A8A8A',
    '#777777', '#797979', '#767676',
    '#8B8B8B', '#C0C0C0'
  ];
  let actualIndex = Math.min(index, definedColors.length - 1);
  return definedColors[actualIndex];
}

String.prototype.toRandomGreyHex = () => {
  let v = (Math.random() * (256) | 0).toString(16);
  return `#` + v + v + v;
}

String.prototype.toRGB = function () {
  let hash = 0;
  if (this.length === 0) return `${hash}`;

  for (let i = 0; i < this.length; i++) {
    hash = this.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  let rgb = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 255;
    rgb[i] = value;
  }
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

String.prototype.toHex = function () {
  let hash = 0;
  if (this.length === 0) return `${hash}`;

  for (let i = 0; i < this.length; i++) {
    hash = this.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 255;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

String.prototype.toColor = function (colors?: string[]) {
  let hash = 0;
  if (colors?.length === 0) return `${hash}`;

  for (let i = 0; i < colors.length; i++) {
    hash = this.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  hash = ((hash % colors.length) + colors.length) % colors.length;
  return colors[hash];
}