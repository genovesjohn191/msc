import {
  Directive,
  OnInit,
  TemplateRef,
  ElementRef,
  ViewContainerRef,
  ChangeDetectorRef
} from '@angular/core';
import { getSafeProperty } from '../../utilities';

@Directive({
  selector: '[mcsComponentHandler]'
})
export class ComponentHandlerDirective implements OnInit {
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _templateRef: TemplateRef<any>,
    private _viewContainer: ViewContainerRef
  ) { }

  public ngOnInit() {
    this.createComponent();
  }

  /**
   * Returns the elementref of the handler
   */
  public get elementRef(): ElementRef<any> {
    return getSafeProperty(this._templateRef, (obj) => obj.elementRef);
  }

  /**
   * Removes the component from the DOM
   */
  public removeComponent() {
    this._viewContainer.clear();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Creates the component from scratch
   *
   * `@Note:`By default the component is created,
   * make sure you use this when the component is not created
   */
  public createComponent() {
    this._viewContainer.createEmbeddedView(this._templateRef);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Recreates the component from the DOM
   */
  public recreateComponent() {
    this.removeComponent();
    Promise.resolve().then(() => this.createComponent());
  }
}
