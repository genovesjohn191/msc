import {
  Input,
  Directive,
  OnInit,
  AfterContentInit,
  OnDestroy,
  ElementRef,
  ViewContainerRef,
  NgZone
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  McsOverlayRef,
  McsOverlayState,
  McsOverlayService,
  McsPortalComponent
} from '@app/core';
import {
  isNullOrEmpty,
  registerEvent,
  unregisterEvent,
  coerceBoolean,
  unsubscribeSafely
} from '@app/utilities';
import {
  TooltipComponent,
  TooltipPosition,
  TooltipColor
} from './tooltip.component';

// Contant declaration
const TOUCHEND_HIDE_DELAY = 1500;

@Directive({
  selector: '[mcsTooltip]',
  host: {
    '(longpress)': 'show()',
    '(touchend)': 'hide(' + TOUCHEND_HIDE_DELAY + ')'
  },
  exportAs: 'mcsTooltip'
})

export class TooltipDirective implements OnInit, AfterContentInit, OnDestroy {

  /**
   * Tooltip message to be displayed
   */
  @Input('mcsTooltip')
  public message: string;

  /**
   * Condition when to display tool tip
   */
  @Input('mcsTooltipShow')
  public get visible(): boolean { return this._visible; }
  public set visible(value: boolean) {
    if (this._visible !== value) { this._visible = coerceBoolean(value); }
  }
  private _visible: boolean = true;

  /**
   * Tool tip position that determines the position of the tooltip
   */
  @Input('mcsTooltipPosition')
  public get position(): TooltipPosition { return this._position; }
  public set position(value: TooltipPosition) {
    if (this._position !== value) {
      this._position = value;
      if (this._tooltipInstance) {
        this._disposeTooltip();
      }
    }
  }
  private _position: TooltipPosition = 'bottom';

  /**
   * Tool tip color to be displayed
   */
  @Input('mcsTooltipColor')
  public get color(): TooltipColor { return this._color; }
  public set color(value: TooltipColor) {
    if (this._color !== value) { this._color = value; }
  }
  private _color: TooltipColor = 'dark';

  // Others declaration
  private _overlayRef: McsOverlayRef | null;
  private _tooltipInstance: TooltipComponent | null;
  private _destroySubject = new Subject<any>();

  // Event handlers reference
  private _mouseEnterHandler = this.show.bind(this);
  private _mouseLeaveHandler = this.hide.bind(this);

  constructor(
    private _elementRef: ElementRef,
    private _viewContainerRef: ViewContainerRef,
    private _overlayService: McsOverlayService,
    private _ngZone: NgZone
  ) { }

  public ngOnInit(): void {
    this._registerEvents();
    this._moveTooltipToHost();
  }

  public ngAfterContentInit(): void {
    this._setTooltipMessage(this.message);
    this._setTooltipColor(this.color);
  }

  public ngOnDestroy(): void {
    this._unregisterEvents();
    unsubscribeSafely(this._destroySubject);
    if (this._tooltipInstance) {
      this._disposeTooltip();
    }
  }

  /**
   * Show the tooltip
   */
  public show(): void {
    if (!this._visible) { return; }
    if (isNullOrEmpty(this._tooltipInstance)) {
      this._createTooltip();
    }

    this._setTooltipMessage(this.message);
    this._setTooltipColor(this.color);
    this._tooltipInstance.show(this.position);
  }

  /**
   * Hide the tooltip
   */
  public hide(delay: number = 0): void {
    if (!isNullOrEmpty(this._tooltipInstance)) {
      this._tooltipInstance.hide(delay);
    }
  }

  /**
   * Set the tool message and notify view for changes
   * @param message Message of the tooltip to be displayed
   */
  private _setTooltipMessage(message: string): void {
    if (isNullOrEmpty(this._tooltipInstance)) { return; }
    this._tooltipInstance.message = message;
    this._tooltipInstance.markForCheck();
  }

  /**
   * Set the color of the tooltip
   * @param color Color of the tooltip to be displayed
   */
  private _setTooltipColor(color: TooltipColor = 'dark'): void {
    if (isNullOrEmpty(this._tooltipInstance)) { return; }
    // this._tooltipInstance.tooltipPanel.nativeElement.classList.add(color.toString());
    this._tooltipInstance.color = color;
    this._tooltipInstance.markForCheck();
  }

  /**
   * Create the tooltip component including the overlay
   */
  private _createTooltip(): void {
    this._overlayRef = this._createOverlay();
    let portal = new McsPortalComponent(TooltipComponent, this._viewContainerRef);
    this._tooltipInstance = this._overlayRef.attachComponent(portal).instance;

    // Close the tooltip when the animation ended
    this._tooltipInstance.afterHidden().subscribe(() => {
      if (!isNullOrEmpty(this._tooltipInstance)) {
        this._disposeTooltip();
      }
    });
  }

  /**
   * Dispose the current displayed tooltip
   */
  private _disposeTooltip(): void {
    if (!isNullOrEmpty(this._overlayRef)) {
      this._overlayRef.dispose();
      this._overlayRef = null;
    }
    this._tooltipInstance = null;
  }

  /**
   * Create the overlay of the tooltip
   */
  private _createOverlay(): McsOverlayRef {
    let overlayRef: McsOverlayRef;
    let overlayState = new McsOverlayState();

    // Create overlay element
    overlayState.hasBackdrop = false;
    overlayState.pointerEvents = 'auto';
    overlayRef = this._overlayService.create(overlayState);
    return overlayRef;
  }

  /**
   * Moves the tooltip relative to host element
   */
  private _moveTooltipToHost(): void {
    this._ngZone.onStable.pipe(takeUntil(this._destroySubject))
      .subscribe(() => {
        if (isNullOrEmpty(this._overlayRef)) { return; }
        this._overlayRef.moveElementTo(this._elementRef.nativeElement, this.position);
      });
  }

  /**
   * Register Events of the tooltip
   */
  private _registerEvents(): void {
    registerEvent(this._elementRef.nativeElement, 'touchstart', this._mouseEnterHandler);
    registerEvent(this._elementRef.nativeElement, 'mouseenter', this._mouseEnterHandler);
    registerEvent(this._elementRef.nativeElement, 'mouseleave', this._mouseLeaveHandler);
  }

  /**
   * Unregister the event of the tooltip
   */
  private _unregisterEvents(): void {
    unregisterEvent(this._elementRef.nativeElement, 'touchstart', this._mouseEnterHandler);
    unregisterEvent(this._elementRef.nativeElement, 'mouseenter', this._mouseEnterHandler);
    unregisterEvent(this._elementRef.nativeElement, 'mouseleave', this._mouseLeaveHandler);
  }
}
