import {
  Directive,
  Renderer,
  ElementRef,
  Component,
  ComponentFactoryResolver,
  ViewContainerRef,
  ComponentRef
} from '@angular/core';

import { LoaderComponent } from '../loader/loader.component';

@Directive({
  selector: '[mcsLoader]',
  exportAs: 'mcsLoader'
})

export class LoaderDirective {
  public loaderComponent: ComponentRef<LoaderComponent>;

  constructor(
    private _renderer: Renderer,
    private _element: ElementRef,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _viewContainerRef: ViewContainerRef
  ) {}

  public showLoader(): void {
    this._renderer.setElementClass(this._element.nativeElement, 'hidden-xl-down', true);
    let factory = this._componentFactoryResolver.resolveComponentFactory(LoaderComponent);
    this.loaderComponent = this._viewContainerRef.createComponent(factory);
    this.loaderComponent.changeDetectorRef.detectChanges();
  }

  public hideLoader(): void {
    this._renderer.setElementClass(this._element.nativeElement, 'hidden-xl-down', false);
    this.loaderComponent.destroy();
  }
}
