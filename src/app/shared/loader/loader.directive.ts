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
  ComponentRef,
  Renderer2,
  ElementRef
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
   * Input for the loader whether it is expanded(absolute) or not
   */
  @Input('mcsLoaderExpanded')
  public get expanded(): boolean { return this._expanded; }
  public set expanded(value: boolean) { this._expanded = coerceBoolean(value); }
  private _expanded: boolean = true;

  /**
   * Set the parent to relative position in case of true, otherwise it is false
   */
  @Input('mcsLoaderRelativeParent')
  public get relativeParent(): boolean { return this._relativeParent; }
  public set relativeParent(value: boolean) {
    this._relativeParent = coerceBoolean(value);
    if (this._relativeParent) {
      this._renderer.setStyle(this._elementRef.nativeElement, 'position', 'relative');
    }
  }
  private _relativeParent: boolean = true;

  /**
   * Hide the given element when activated
   */
  @Input('mcsLoaderHideElement')
  public get hideElement(): HTMLElement { return this._hideElement; }
  public set hideElement(value: HTMLElement) { this._hideElement = value; }
  private _hideElement: HTMLElement;

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
    private _renderer: Renderer2,
    private _elementRef: ElementRef
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
      this.componentRef.instance.expanded = this.expanded;
      this.componentRef.instance.size = this.size;
      this.componentRef.instance.text = this.text;
      this.componentRef.instance.orientation = this.orientation;
      this._showHideTargetElement(false);
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
      this._showHideTargetElement(true);
    }
  }

  /**
   * Show or Hide target element when loader ended
   * @param show
   */
  private _showHideTargetElement(show: boolean): void {
    if (isNullOrEmpty(this._hideElement)) { return; }

    // Show to hide the target element based on flag
    !show ? this._renderer.addClass(this._hideElement, 'hide-element') :
      this._renderer.removeClass(this._hideElement, 'hide-element');
  }
}
