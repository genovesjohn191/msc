import {
  Injectable,
  HostListener,
  OnInit
} from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import { McsDeviceType } from '../enumerations/mcs-device-type.enum';
import { CoreDefinition } from '../core.definition';

export * from '../enumerations/mcs-device-type.enum';

@Injectable()
export class McsBrowserService {

  /**
   * Listener for resizing of window.::.
   * This will notify all subscribers when the browser is resized
   */
  private _resizeWindowStream: BehaviorSubject<McsDeviceType>;
  public get resizeWindowStream(): BehaviorSubject<McsDeviceType> {
    return this._resizeWindowStream;
  }
  public set resizeWindowStream(value: BehaviorSubject<McsDeviceType>) {
    this._resizeWindowStream = value;
  }

  constructor() {
    this._resizeWindowStream = new BehaviorSubject<McsDeviceType>(McsDeviceType.Desktop);
    this.Initialize();
  }

  /**
   * Initialize stream and raise for resize event initially
   */
  public Initialize() {
    // Register the resize event
    window.addEventListener('resize', ($event) => {
      this.OnResizeWindow($event);
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
  public OnResizeWindow(event: any): void {
    let width: number;
    width = event.target.innerWidth;

    if (width >= CoreDefinition.DESKTOP_MIN_WIDTH) {
      this._resizeWindowStream.next(McsDeviceType.Desktop);

    } else if (width >= CoreDefinition.TABLET_MIN_WIDTH) {
      this._resizeWindowStream.next(McsDeviceType.Tablet);

    } else if (width >= CoreDefinition.MOBILE_LANDSCAPE_MIN_WIDTH) {
      this._resizeWindowStream.next(McsDeviceType.MobileLandscape);

    } else {
      this._resizeWindowStream.next(McsDeviceType.MobilePortrait);

    }
  }
}
