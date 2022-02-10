import { Subscription } from 'rxjs';

import {
  ComponentRef,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {
  Event as RouterEvent,
  NavigationEnd,
  Router
} from '@angular/router';
import { McsScrollDispatcherService } from '@app/core';
import {
  getElementOffset,
  getElementPosition,
  getElementPositionFromHost,
  getSafeProperty,
  isNullOrEmpty,
  registerEvent,
  unregisterEvent,
  unsubscribeSafely
} from '@app/utilities';

import { OverlayConfig } from '../overlay/overlay-config';
import { OverlayRef } from '../overlay/overlay-ref';
import { OverlayService } from '../overlay/overlay.service';
import { PortalComponent } from '../portal-template/portal-component';
import { PopoverComponent } from './popover.component';
import { PopoverService } from './popover.service';

// Offet of the arrow from left/right/top/bottom
const POPOVER_ARROW_OFFSET = 20;

@Directive({
  selector: '[mcsPopover]',
  exportAs: 'mcsPopover'
})

export class PopoverDirective implements OnInit, OnDestroy {
  @Input()
  public autoCalculatePosition: boolean;

  @Input()
  public priority: 'low' | 'medium' | 'high' | 'max';

  @Input()
  public content: TemplateRef<any>;

  @Input()
  public maxWidth: string;

  @Input()
  public padding: 'default' | 'none';

  @Input()
  public theme: 'dark' | 'light' | 'gray';

  @Input()
  public trigger: 'manual' | 'hover';

  @Input()
  public placementElement: HTMLElement | ElementRef;

  @Input()
  public placement: 'top' | 'bottom' | 'center' | 'left' | 'right';

  @Input()
  public orientation: 'top' | 'bottom' | 'center' | 'left' | 'right';

  @Output()
  public onOpen: EventEmitter<any>;

  @Output()
  public onClose: EventEmitter<any>;

  // Others
  public componentRef: ComponentRef<PopoverComponent>;
  public zoneSubscription: Subscription;
  private _routerSubscription: Subscription;
  private _overlayRef: OverlayRef;

  /**
   * Event handler references
   */
  private _mouseEnterHandler = this.openOnMouseHover.bind(this);
  private _mouseLeaveHandler = this.closeOnMouseLeave.bind(this);
  private _mouseClickHandler = this.onClick.bind(this);

  constructor(
    private _elementRef: ElementRef,
    private _viewContainerRef: ViewContainerRef,
    private _ngZone: NgZone,
    private _router: Router,
    private _scrollDispatcher: McsScrollDispatcherService,
    private _overlayService: OverlayService,
    private _popoverService: PopoverService
  ) {
    // Set default values for Inputs
    this.autoCalculatePosition = true;
    this.priority = 'low';
    this.placement = 'bottom';
    this.orientation = 'center';
    this.maxWidth = '250px';
    this.theme = 'light';
    this.trigger = 'manual';
    this.padding = 'default';
    this.onOpen = new EventEmitter();
    this.onClose = new EventEmitter();

    // Move popover element position when angular view is stable
    this.zoneSubscription = this._ngZone.onStable.subscribe(() => {
      if (this.componentRef) {
        this.moveElementPosition(this.orientation);
      }
    });

    // Listen for every scroll position
    this._scrollDispatcher.scrolled(0, () => {
      if (this.componentRef) {
        this.moveElementPosition(this.orientation);
      }
    });
  }

  public ngOnInit() {
    // Register all events listener
    this._registerEvents();
    this._listenToRouterEvents();
  }

  public ngOnDestroy() {
    this._unregisterEvents();
    this.close();
    unsubscribeSafely(this.zoneSubscription);
    unsubscribeSafely(this._routerSubscription);
  }

  public open() {
    this._removeActivePopover();

    // Create overlay element
    let overlayState = new OverlayConfig();
    overlayState.hasBackdrop = false;
    overlayState.pointerEvents = 'auto';
    this._overlayRef = this._overlayService.create(overlayState);

    // Create template portal and attach to overlay
    let portalComponent = new PortalComponent(
      PopoverComponent, this._viewContainerRef, this.content
    );

    // Set Input parameters of popover component
    this.componentRef = this._overlayRef.attachComponent(portalComponent);
    this.componentRef.instance.placement = this.placement;
    this.componentRef.instance.maxWidth = this.maxWidth;
    this.componentRef.instance.theme = this.theme;
    this.componentRef.instance.trigger = this.trigger;
    this.componentRef.instance.padding = this.padding;
    this.componentRef.instance.priority = this.priority;
    this.componentRef.instance.onClickOutsideEvent.subscribe((event) => {
      this.onClickOutside(event);
    });
    this.componentRef.changeDetectorRef.markForCheck();
    this.onOpen.emit();

    // Set active popover
    this._popoverService.activePopover = this;
  }

  public close() {
    if (isNullOrEmpty(this._overlayRef)) { return; }
    this._overlayRef.detach();
    this._overlayRef.dispose();
    this._overlayRef = null;

    if (this.componentRef) {
      this.componentRef = null;
      this.onClose.emit();
    }
  }

  public toggle() {
    if (this.componentRef) {
      this.close();
    } else {
      this.open();
    }
  }

  public onClickOutside(event: any): void {
    if (!this.componentRef) { return; }
    if (!this.componentRef.instance.contentElement.nativeElement.contains(event.target) &&
      !this._elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  public onClick(): void {
    if (this.trigger !== 'manual') { return; }
    this.toggle();
  }

  public openOnMouseHover(): void {
    if (this.trigger !== 'hover') { return; }
    this.open();
  }

  public closeOnMouseLeave(): void {
    if (this.trigger !== 'hover') { return; }
    this.close();
  }

  public moveElementPosition(orientation: string) {
    let isHostElementRendered = getSafeProperty(this.componentRef, (obj) => obj.instance.contentElement.nativeElement);
    if (isNullOrEmpty(isHostElementRendered)) { return; }

    // Update the placement of the component itself
    let placement = this.autoCalculatePosition ? this._getActualPlacement() : this.placement;
    this.componentRef.instance.placement = placement;

    // Move the element based on the placement position
    let targetElementPosition: any;
    targetElementPosition = getElementPosition(this.componentRef.location.nativeElement);
    this.setPopoverPlacement(placement);

    // Set popover orientation
    switch (placement) {
      case 'left':
      case 'right':
        if (orientation === 'bottom') {
          this.setBottomOrientation(targetElementPosition);
        } else if (orientation === 'top') {
          this.setTopOrientation(targetElementPosition);
        }
        break;

      case 'bottom':
      case 'top':
        if (orientation === 'left') {
          this.setLeftOrientation(targetElementPosition);
        } else if (orientation === 'right') {
          this.setRightOrientation(targetElementPosition);
        }
        break;
    }
  }

  public setTopOrientation(elementPosition: DOMRect) {
    let topPosition = elementPosition.height * 0.5 - POPOVER_ARROW_OFFSET;
    this.componentRef.instance.contentElement
      .nativeElement.style.top = `${-topPosition}px`;
  }

  public setBottomOrientation(elementPosition: DOMRect) {
    let bottomPosition = elementPosition.height * 0.5 - POPOVER_ARROW_OFFSET;
    this.componentRef.instance.contentElement
      .nativeElement.style.bottom = `${-bottomPosition}px`;
  }

  public setLeftOrientation(elementPosition: DOMRect) {
    let leftPosition = elementPosition.width * 0.5 - POPOVER_ARROW_OFFSET;
    this.componentRef.instance.contentElement
      .nativeElement.style.left = `${-leftPosition}px`;
  }

  public setRightOrientation(elementPosition: DOMRect) {
    let rightPosition = elementPosition.width * 0.5 - POPOVER_ARROW_OFFSET;
    this.componentRef.instance.contentElement
      .nativeElement.style.right = `${-rightPosition}px`;
  }

  public setPopoverPlacement(placement: string) {
    let targetPlacementElement = isNullOrEmpty(this.placementElement) ?
      this._elementRef.nativeElement : this.placementElement;

    let targetElementPosition = getElementPositionFromHost(
      targetPlacementElement,
      this.componentRef.location.nativeElement,
      placement, true);

    this.componentRef.location
      .nativeElement.style.top = `${targetElementPosition.top}px`;

    this.componentRef.location
      .nativeElement.style.left = `${targetElementPosition.left}px`;
  }

  /**
   * Register the events of the popover
   */
  private _registerEvents(): void {
    switch (this.trigger) {
      case 'hover':
        registerEvent(this._elementRef.nativeElement, 'mouseenter', this._mouseEnterHandler);
        registerEvent(this._elementRef.nativeElement, 'mouseleave', this._mouseLeaveHandler);
        break;
      case 'manual':
      default:
        registerEvent(this._elementRef.nativeElement, 'click', this._mouseClickHandler);
        break;
    }
  }

  /**
   * Unregister the events of the popover
   */
  private _unregisterEvents(): void {
    unregisterEvent(this._elementRef.nativeElement, 'mouseenter', this._mouseEnterHandler);
    unregisterEvent(this._elementRef.nativeElement, 'mouseleave', this._mouseLeaveHandler);
    unregisterEvent(this._elementRef.nativeElement, 'click', this._mouseClickHandler);
  }

  /**
   * Get the actual placement of the popover based on the opposite side
   * when it is not fitted on the screen
   */
  private _getActualPlacement(): string {
    let placement: string;
    let isFitted = this._isFitToScreen();

    switch (this.placement) {
      case 'top':
        placement = isFitted ? this.placement : 'bottom';
        break;
      case 'left':
        placement = isFitted ? this.placement : 'right';
        break;
      case 'right':
        placement = isFitted ? this.placement : 'left';
        break;
      case 'bottom':
      default:
        placement = isFitted ? this.placement : 'top';
        break;
    }
    return placement;
  }

  /**
   * This will return true when the popover to be opened is fit to screen
   * otherwise false (overlapped)
   */
  private _isFitToScreen(): boolean {
    let fitToScreen: boolean = true;

    // Get scrollable element associated with the host element
    let scrollableElemet = this._scrollDispatcher.getScrollableParentContainer(this._elementRef);
    if (isNullOrEmpty(scrollableElemet)) { return true; }

    // Get the scroll bottom position of the scrollable element to check
    // weather the element is fit to screen
    let scrollTop = scrollableElemet.getElementRef().nativeElement.scrollTop;
    let scrollLeft = scrollableElemet.getElementRef().nativeElement.scrollLeft;
    let scrollBottom = scrollTop + window.innerHeight;
    let scrollRight = scrollLeft + window.innerWidth;

    // Calculate the actual size of the popover including the offset of the host element
    let popoverHeight = this.componentRef.instance.contentElement.nativeElement.offsetHeight;
    let popoverWidth = this.componentRef.instance.contentElement.nativeElement.offsetWidth;
    let targetPlacementElement = isNullOrEmpty(this.placementElement) ?
      this._elementRef.nativeElement : this.placementElement;
    let hostOffset = getElementOffset(targetPlacementElement);

    // Set popover actual position based on the screen size
    switch (this.placement) {
      case 'left': {
        let actualWidth = scrollLeft + hostOffset.right + popoverWidth;
        if (actualWidth > scrollLeft) { fitToScreen = false; }
        break;
      }
      case 'right': {
        let actualWidth = scrollLeft + hostOffset.right + popoverWidth;
        if (actualWidth > scrollRight) { fitToScreen = false; }
        break;
      }
      case 'top': {
        let actualHeight = scrollTop + hostOffset.bottom + popoverHeight;
        if (actualHeight > scrollTop) { fitToScreen = false; }
        break;
      }
      case 'bottom':
      default: {
        let actualHeight = scrollTop + hostOffset.bottom + popoverHeight;
        if (actualHeight > scrollBottom) { fitToScreen = false; }
        break;
      }
    }
    return fitToScreen;
  }

  /**
   * Remove the currently active popover to make sure that
   * there is only 1 popover display in the DOM
   *
   * `@Note:` This will fixed the issue of the stopPropagation.
   * The document click was not triggered when the executable element
   * is clicked because it is considered as parent element
   */
  private _removeActivePopover(): void {
    if (isNullOrEmpty(this._popoverService.activePopover)) { return; }
    this._popoverService.activePopover.close();
  }

  /**
   * Listen to every route changed to close the dialog itself
   */
  private _listenToRouterEvents(): void {
    this._routerSubscription = this._router.events
      .subscribe((event: RouterEvent) => {
        if (event instanceof NavigationEnd) {
          this.close();
        }
      });
  }
}
