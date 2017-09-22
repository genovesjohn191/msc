import {
  Directive,
  OnInit,
  DoCheck,
  OnDestroy,
  Injector,
  ComponentFactoryResolver,
  ViewContainerRef,
  Input,
  ComponentRef,
  Renderer2
} from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { LoaderService } from './loader.service';
import { McsComponentService } from '../../core';
import {
  isNullOrEmpty,
  refreshView
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
      }, 300);
    }
  }
}
