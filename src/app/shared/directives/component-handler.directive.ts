import {
  Directive,
  OnInit,
  TemplateRef,
  ElementRef,
  ViewContainerRef,
  ChangeDetectorRef,
  EmbeddedViewRef
} from '@angular/core';
import {
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';

@Directive({
  selector: '[mcsComponentHandler]',
  exportAs: 'mcsComponentHandler'
})
export class ComponentHandlerDirective implements OnInit {
  private _embeddedViewRef: EmbeddedViewRef<any>;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    public templateRef: TemplateRef<any>,
    public viewContainer: ViewContainerRef
  ) { }

  public ngOnInit() {
    this.createComponent();
  }

  /**
   * Returns the elementref of the handler
   */
  public get elementRef(): ElementRef<any> {
    return getSafeProperty(this.templateRef, (obj) => obj.elementRef);
  }

  /**
   * Removes the component from the DOM
   */
  public removeComponent() {
    this.viewContainer.clear();
    this._embeddedViewRef = null;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Creates the component from scratch
   *
   * `@Note:`By default the component is created,
   * make sure you use this when the component is not created
   */
  public createComponent() {
    if (!isNullOrEmpty(this._embeddedViewRef)) { return; }

    this._embeddedViewRef = this.viewContainer.createEmbeddedView(this.templateRef);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Recreates the component from the DOM
   */
  public recreateComponent() {
    this.removeComponent();
    requestAnimationFrame(() => this.createComponent());
  }
}
