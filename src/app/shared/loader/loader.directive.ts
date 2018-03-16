import {
  Directive,
  OnInit,
  DoCheck,
  OnDestroy,
  Injector,
  ComponentFactoryResolver,
  ViewContainerRef,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ComponentRef,
  Renderer2
} from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { LoaderService } from './loader.service';
import { McsComponentService, CoreDefinition } from '../../core';
import {
  isNullOrEmpty,
  refreshView,
  coerceBoolean
} from '../../utilities';
import { LoaderComponent } from './loader.component';

// Target Element Type
type TargetElementType = ElementRef | HTMLElement;

@Directive({
  selector: '[mcsLoader]',
  providers: [LoaderService]
})

export class LoaderDirective implements OnInit, DoCheck, OnDestroy {

  public componentRef: ComponentRef<LoaderComponent>;
  public componentService: McsComponentService<LoaderComponent>;

  /**
   * Event that emits when the loader ended
   */
  @Output()
  public mcsLoaderEnded = new EventEmitter<boolean>();

  /**
   * The observable subscription that represents as the basis of processing
   */
  @Input('mcsLoader')
  public get subscriptions(): Subscription | Subscription[] {
    return this._subscriptions;
  }
  public set subscriptions(value: Subscription | Subscription[]) {
    if (this._subscriptions !== value) {
      this._subscriptions = value;
      this._loaderService.setSubscribers(this.subscriptions);
    }
  }
  private _subscriptions: Subscription | Subscription[];

  /**
   * Hide the given element when activated
   */
  @Input('mcsLoaderHideElement')
  public get hideElement(): TargetElementType { return this._hideElement; }
  public set hideElement(value: TargetElementType) { this._hideElement = value; }
  private _hideElement: TargetElementType;

  /**
   * Flag that determine whether the height of the loader should be preserve
   */
  @Input('mcsLoaderPreserveHeight')
  public get preserveHeight(): boolean { return this._preserveHeight; }
  public set preserveHeight(value: boolean) { this._preserveHeight = coerceBoolean(value); }
  private _preserveHeight: boolean;

  /**
   * Input size for the loader to set
   */
  @Input('mcsLoaderSize')
  public get size(): string { return this._size; }
  public set size(value: string) { this._size = value; }
  private _size: string = 'xlarge';

  /**
   * Loader text content
   */
  @Input('mcsLoaderText')
  public get text(): string { return this._text; }
  public set text(value: string) { this._text = value; }
  private _text: string;

  /**
   * Loader text content orientation
   */
  @Input('mcsLoaderOrientation')
  public get orientation(): string { return this._orientation; }
  public set orientation(value: string) { this._orientation = value; }
  private _orientation: string;

  constructor(
    private _loaderService: LoaderService,
    private _injector: Injector,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _viewContainerRef: ViewContainerRef,
    private _renderer: Renderer2
  ) {
    this._subscriptions = new Array();
  }

  public ngOnInit() {
    // Initilize component service instance to set the view host attributes
    this.componentService = new McsComponentService<LoaderComponent>(
      LoaderComponent,
      this._componentFactoryResolver,
      this._viewContainerRef,
      this._injector,
      this._renderer
    );
  }

  public ngOnDestroy() {
    this.hideLoader();
  }

  public ngDoCheck() {
    if (isNullOrEmpty(this.subscriptions)) { return; }

    // Always check for the active flag for loader component to display
    if (this._loaderService.isActive()) {
      this.showLoader();
    } else {
      this.hideLoader();
    }
  }

  /**
   * Show the loader including the backdrop
   */
  public showLoader() {
    if (isNullOrEmpty(this.componentRef)) {
      this.componentRef = this.componentService.createComponent();
      this.componentRef.instance.size = this.size;
      this.componentRef.instance.text = this.text;
      this.componentRef.instance.orientation = this.orientation;
      this._hideTargetElement(true);
    }
  }

  /**
   * Hide the loader including the backdrop
   */
  public hideLoader() {
    if (!isNullOrEmpty(this.componentRef)) {

      // Add delay to show the animation first before deleting the component
      refreshView(() => {
        this.componentService.deleteComponent();
        this.componentRef = null;
      }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
      this.mcsLoaderEnded.emit(true);
      this._hideTargetElement(false);
    }
  }

  /**
   * Hide target element based on the given input
   * @param hide Hide flag to be determine whether the target element is hidden
   */
  private _hideTargetElement(hide: boolean): void {
    if (isNullOrEmpty(this._hideElement)) { return; }

    // Set target element based on type
    let targetElement: HTMLElement = this._hideElement instanceof ElementRef ?
      this._hideElement.nativeElement : this._hideElement;

    // Set the mock size of the element
    if (this.preserveHeight) {
      let targetElementHeight = targetElement.clientHeight;
      this._renderer.setStyle(this.componentRef.location.nativeElement,
        'height', `${targetElementHeight}px`);
    }

    // Show to hide the target element based on flag
    if (hide) {
      this._renderer.addClass(targetElement, 'hide-element');
    } else {
      this._renderer.removeClass(targetElement, 'hide-element');
    }
  }
}
