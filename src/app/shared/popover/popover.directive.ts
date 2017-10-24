import {
  Directive,
  ElementRef,
  ViewContainerRef,
  NgZone,
  OnInit,
  OnDestroy,
  Input,
  Output,
  TemplateRef,
  ComponentRef,
  EventEmitter
} from '@angular/core';
import {
  McsScrollDispatcherService,
  McsOverlayService,
  McsOverlayRef,
  McsOverlayState,
  McsPortalComponent
} from '../../core';
import {
  getElementPositionFromHost,
  getElementPosition,
  registerEvent,
  isNullOrEmpty,
  unregisterEvent
} from '../../utilities';
import { PopoverComponent } from './popover.component';

// Offet of the arrow from left/right/top/bottom
const POPOVER_ARROW_OFFSET = 20;

@Directive({
  selector: '[mcsPopover]',
  exportAs: 'mcsPopover'
})

export class PopoverDirective implements OnInit, OnDestroy {
  @Input()
  public priority: 'low' | 'medium' | 'high';

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
  public placement: 'top' | 'bottom' | 'center' | 'left' | 'right';

  @Input()
  public orientation: 'top' | 'bottom' | 'center' | 'left' | 'right';

  @Output()
  public onOpen: EventEmitter<any>;

  @Output()
  public onClose: EventEmitter<any>;

  // Others
  public componentRef: ComponentRef<PopoverComponent>;
  public zoneSubscription: any;
  private _overlayRef: McsOverlayRef;

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
    private _scrollDispatcher: McsScrollDispatcherService,
    private _overlayService: McsOverlayService
  ) {
    // Set default values for Inputs
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
        this.moveElementPosition(this.placement, this.orientation);
      }
    });

    // Listen for every scroll position
    this._scrollDispatcher.scrolled(0, () => {
      if (this.componentRef) {
        this.moveElementPosition(this.placement, this.orientation);
      }
    });
  }

  public ngOnInit() {
    // Register all events listener
    this._registerEvents();
  }

  public ngOnDestroy() {
    this._unregisterEvents();
    this.close();
    if (this.zoneSubscription) {
      this.zoneSubscription.unsubscribe();
    }
  }

  public open() {
    // Create overlay element
    let overlayState = new McsOverlayState();
    overlayState.hasBackdrop = false;
    overlayState.pointerEvents = 'auto';
    this._overlayRef = this._overlayService.create(overlayState);

    // Create template portal and attach to overlay
    let portalComponent = new McsPortalComponent(
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

  public moveElementPosition(placement: string, orientation: string) {
    let targetElementPosition: any;
    targetElementPosition = getElementPosition(this.componentRef.location.nativeElement);
    this.setPopoverPlacement();

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
      default:
        break;
    }
  }

  public setTopOrientation(elementPosition: ClientRect) {
    let topPosition = elementPosition.height * 0.5 - POPOVER_ARROW_OFFSET;
    this.componentRef.instance.contentElement
      .nativeElement.style.top = `${-topPosition}px`;
  }

  public setBottomOrientation(elementPosition: ClientRect) {
    let bottomPosition = elementPosition.height * 0.5 - POPOVER_ARROW_OFFSET;
    this.componentRef.instance.contentElement
      .nativeElement.style.bottom = `${-bottomPosition}px`;
  }

  public setLeftOrientation(elementPosition: ClientRect) {
    let leftPosition = elementPosition.width * 0.5 - POPOVER_ARROW_OFFSET;
    this.componentRef.instance.contentElement
      .nativeElement.style.left = `${-leftPosition}px`;
  }

  public setRightOrientation(elementPosition: ClientRect) {
    let rightPosition = elementPosition.width * 0.5 - POPOVER_ARROW_OFFSET;
    this.componentRef.instance.contentElement
      .nativeElement.style.right = `${-rightPosition}px`;
  }

  public setPopoverPlacement() {
    let targetElementPosition = getElementPositionFromHost(
      this._elementRef.nativeElement,
      this.componentRef.location.nativeElement,
      this.placement, true);

    this.componentRef.location
      .nativeElement.style.top = `${targetElementPosition.top}px`;

    this.componentRef.location
      .nativeElement.style.left = `${targetElementPosition.left}px`;
  }

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

  private _unregisterEvents(): void {
    unregisterEvent(this._elementRef.nativeElement, 'mouseenter', this._mouseEnterHandler);
    unregisterEvent(this._elementRef.nativeElement, 'mouseleave', this._mouseLeaveHandler);
    unregisterEvent(this._elementRef.nativeElement, 'click', this._mouseClickHandler);
  }
}
