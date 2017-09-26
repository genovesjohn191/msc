import {
  OnInit,
  OnDestroy,
  Directive,
  Input,
  ElementRef,
  Renderer2
} from '@angular/core';
import {
  McsBrowserService,
  McsDeviceType
} from '../../core';
import {
  registerEvent,
  unregisterEvent
} from '../../utilities';

@Directive({
  selector: '[mcsContextualHelp]'
})

export class ContextualHelpDirective implements OnInit, OnDestroy {
  public browserStreamSubscription: any;

  @Input()
  public mcsContextualHelp: string;

  /**
   * Focus flag that determines weather the directive has received focus,
   * and that corresponding styling for the contextual help should be applied
   */
  private _hasFocus: boolean;
  public get hasFocus(): boolean {
    return this._hasFocus;
  }
  public set hasFocus(value: boolean) {
    this._hasFocus = value;
  }

  constructor(
    private _elementRef: ElementRef,
    private _renderer: Renderer2,
    private _browserService: McsBrowserService
  ) {
    this.mcsContextualHelp = '';
  }

  public ngOnInit() {
    this.browserStreamSubscription = this._browserService.deviceTypeStream
      .subscribe((device) => {
        if (device === McsDeviceType.Desktop) {
          this._registerEvents();
        } else {
          this._unregisterEvents();
        }
      });
  }

  public ngOnDestroy() {
    if (this.browserStreamSubscription) {
      this.browserStreamSubscription.unsubscribe();
    }
    this._unregisterEvents();
  }

  /**
   * Get the host element reference which serves as the
   * attachment of the contextual help
   *
   * `@Note` This position of these should be static
   * so that it will get the actual direction
   */
  public getHostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  /**
   * Get the contextual help given on the directive element
   */
  public getContextualHelp(): string {
    return this.mcsContextualHelp;
  }

  /**
   * Visibility flag to check if the context should be dispayed or not
   * according with its parent element, if the parent element is not display
   * then the contextual help should not be display also
   */
  public isVisible(): boolean {
    return this._elementRef.nativeElement.offsetParent !== null;
  }

  private _onMouseEnter(): void {
    this._hasFocus = true;
  }

  private _onMouseLeave(): void {
    this._hasFocus = false;
  }

  private _registerEvents(): void {
    // Register both for mouse in and mouse out
    registerEvent(this._renderer, this._elementRef.nativeElement,
      'mouseenter', this._onMouseEnter.bind(this));
    registerEvent(this._renderer, this._elementRef.nativeElement,
      'mouseleave', this._onMouseLeave.bind(this));
  }

  private _unregisterEvents(): void {
    // Unregister both for mouse in and mouse out
    unregisterEvent(this._elementRef.nativeElement,
      'mouseenter', this._onMouseEnter.bind(this));
    unregisterEvent(this._elementRef.nativeElement,
      'mouseleave', this._onMouseLeave.bind(this));
  }
}
