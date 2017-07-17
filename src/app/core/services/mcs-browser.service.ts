import {
  Injectable,
  HostListener,
  OnInit
} from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import { McsDeviceType } from '../enumerations/mcs-device-type.enum';
import { McsSize } from '../models/mcs-size';
import { CoreDefinition } from '../core.definition';

export * from '../enumerations/mcs-device-type.enum';

@Injectable()
export class McsBrowserService {

  /**
   * Listener for resizing of window.::.
   * This will notify all subscribers when the browser is resized
   * and provide the device type based on the current size of the window (browser)
   */
  private _deviceTypeStream: BehaviorSubject<McsDeviceType>;
  public get deviceTypeStream(): BehaviorSubject<McsDeviceType> {
    return this._deviceTypeStream;
  }
  public set deviceTypeStream(value: BehaviorSubject<McsDeviceType>) {
    this._deviceTypeStream = value;
  }

  /**
   * Listener for resizing of window.::.
   * This will notify all subscribers when the browser is resized
   * and provide the current size of the window (browser)
   */
  private _windowSizeStream: BehaviorSubject<McsSize>;
  public get windowSizeStream(): BehaviorSubject<McsSize> {
    return this._windowSizeStream;
  }
  public set windowSizeStream(value: BehaviorSubject<McsSize>) {
    this._windowSizeStream = value;
  }

  constructor() {
    this._deviceTypeStream = new BehaviorSubject<McsDeviceType>(McsDeviceType.Desktop);
    this._windowSizeStream = new BehaviorSubject<McsSize>(new McsSize());
    this.initialize();
  }

  /**
   * Initialize stream and raise for resize event initially
   */
  public initialize() {
    // Register the resize event
    window.addEventListener('resize', ($event) => {
      this.onResizeWindow($event);
    });

    // Invoke resize event during initialization to set the device type
    let event = document.createEvent('Event');
    event.initEvent('resize', false, true);
    window.dispatchEvent(event);
  }

  /**
   * This event will invoke when the window/browser size is changed
   * @param event Resize event properties
   */
  public onResizeWindow(event: any): void {
    let width: number;
    width = event.target.innerWidth;

    // Notify window size subscriber
    this._windowSizeStream.next({
      width: event.target.innerWidth,
      height: event.target.innerHeight
    } as McsSize
    );

    // Notify device type subscriber
    if (width >= CoreDefinition.DESKTOP_MIN_WIDTH) {
      this._deviceTypeStream.next(McsDeviceType.Desktop);

    } else if (width >= CoreDefinition.TABLET_MIN_WIDTH) {
      this._deviceTypeStream.next(McsDeviceType.Tablet);

    } else if (width >= CoreDefinition.MOBILE_LANDSCAPE_MIN_WIDTH) {
      this._deviceTypeStream.next(McsDeviceType.MobileLandscape);

    } else {
      this._deviceTypeStream.next(McsDeviceType.MobilePortrait);

    }
  }

  /**
   * This event for scrolling page back to top
   */
  public scrollToTop(): void {
    return window.scrollTo(0, 0);
  }
}
