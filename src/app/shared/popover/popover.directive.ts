import {
  Directive,
  ElementRef,
  Injector,
  ComponentFactoryResolver,
  ViewContainerRef,
  NgZone,
  OnInit,
  OnDestroy,
  Input,
  Output,
  TemplateRef,
  ComponentRef,
  Renderer2,
  EventEmitter
} from '@angular/core';
import { McsComponentService } from '../../core';
import {
  getElementPositionFromHost,
  getElementPosition,
  registerEvent
} from '../../utilities';
import { PopoverComponent } from './popover.component';

// Offet of the arrow from left/right/top/bottom
const POPOVER_ARROW_OFFSET = 30;

@Directive({
  selector: '[mcsPopover]',
  exportAs: 'mcsPopover'
})

export class PopoverDirective implements OnInit, OnDestroy {
  @Input()
  public title: TemplateRef<any> | string;

  @Input()
  public content: TemplateRef<any> | string;

  @Input()
  public maxWidth: string;

  @Input()
  public elementContainer: 'default' | 'body';

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

  public componentService: McsComponentService<PopoverComponent>;
  public componentRef: ComponentRef<PopoverComponent>;
  public zoneSubscription: any;

  constructor(
    private _elementRef: ElementRef,
    private _injector: Injector,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _viewContainerRef: ViewContainerRef,
    private _renderer: Renderer2,
    private _ngZone: NgZone
  ) {
    // Set default values for Inputs
    this.placement = 'bottom';
    this.orientation = 'center';
    this.maxWidth = '250px';
    this.theme = 'light';
    this.trigger = 'manual';
    this.padding = 'default';
    this.elementContainer = 'body';
    this.onOpen = new EventEmitter();
    this.onClose = new EventEmitter();
  }

  public ngOnInit() {
    // Initilize component service instance to set the view host attributes
    this.componentService = new McsComponentService<PopoverComponent>(
      PopoverComponent,
      this._componentFactoryResolver,
      this._viewContainerRef,
      this._injector,
      this._renderer
    );

    // Register all events listener
    this._registerEvents();

    // Move popover element position when angular view is stable
    this.zoneSubscription = this._ngZone.onStable.subscribe(() => {
      if (this.componentRef) {
        this.moveElementPosition(this.placement, this.orientation);
      }
    });
  }

  public ngOnDestroy() {
    this.close();
    if (this.zoneSubscription) {
      this.zoneSubscription.unsubscribe();
    }
  }

  public open() {
    if (!this.componentRef) {
      this.componentRef = this.componentService
        .createComponent([this.title, this.content]);

      this.componentRef.instance.title = this.title;
      this.componentRef.instance.placement = this.placement;
      this.componentRef.instance.maxWidth = this.maxWidth;
      this.componentRef.instance.theme = this.theme;
      this.componentRef.instance.trigger = this.trigger;
      this.componentRef.instance.padding = this.padding;
      this.componentRef.instance.onClickOutsideEvent.subscribe((event) => {
        this.onClickOutside(event);
      });

      // Attach popover element inside the body
      if (this.elementContainer === 'body') {
        window.document.querySelector(this.elementContainer)
          .appendChild(this.componentRef.location.nativeElement);
      }

      this.componentRef.changeDetectorRef.markForCheck();
      this.onOpen.emit();
    }
  }

  public close() {
    if (this.componentRef) {
      this.componentService.deleteComponent();
      this.componentRef.destroy();
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
      this.placement, this.elementContainer === 'body');

    this.componentRef.location
      .nativeElement.style.top = `${targetElementPosition.top}px`;

    this.componentRef.location
      .nativeElement.style.left = `${targetElementPosition.left}px`;
  }

  private _registerEvents(): void {
    switch (this.trigger) {
      case 'hover':
        // Register both for mouse in and mouse out
        registerEvent(this._renderer, this._elementRef.nativeElement,
          'mouseenter', this.openOnMouseHover.bind(this));
        registerEvent(this._renderer, this._elementRef.nativeElement,
          'mouseleave', this.closeOnMouseLeave.bind(this));
        break;

      case 'manual':
      default:
        // Register for mouse click
        registerEvent(this._renderer, this._elementRef.nativeElement,
          'click', this.onClick.bind(this));
        break;
    }
  }
}
