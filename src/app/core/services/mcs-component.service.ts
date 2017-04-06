import {
  Injector,
  EmbeddedViewRef,
  TemplateRef,
  ViewContainerRef,
  Renderer,
  ComponentRef,
  ComponentFactoryResolver
} from '@angular/core';

/**
 * Component service for creation of component dynamically
 */
export class McsComponentService<T> {
  private _componentFactory: any;
  private _componentRef: ComponentRef<T>;
  private _contentRef: EmbeddedViewRef<any>;

  constructor(
    private _componentType: any,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _viewContainerRef: ViewContainerRef,
    private _renderer: Renderer,
    private _injector: Injector
  ) {
    this._componentFactory = this._componentFactoryResolver
      .resolveComponentFactory<T>(this._componentType);
  }

  /**
   * Create the component dynamically
   * @param content Template element to be inserted after the component view implementation
   */
  public createComponent(content?: TemplateRef<any>): ComponentRef<T> {
    if (!this._componentRef) {
      this._contentRef = this._createContentView(content);
      this._componentRef = this._createComponentView();
    }
    return this._componentRef;
  }

  /**
   * Delete the created component
   */
  public deleteComponent(): void {
    // Delete the view of the created component
    if (this._componentRef) {
      this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._componentRef.hostView));
      this._componentRef = null;
    }
    // Delete the content(template) view of the created component
    if (this._contentRef) {
      this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._contentRef));
      this._contentRef = null;
    }
  }

  /**
   * Create the content view (template)
   * @param content Template element to be inserted after the component view implementation
   * @param context Context for the template to be attached to (i.e body)
   */
  private _createContentView(content: TemplateRef<any>, context?: any) {
    if (content) {
      return this._viewContainerRef.createEmbeddedView(<TemplateRef<T>> content, context);
    } else {
      return undefined;
    }
  }

  /**
   * Create Component view (Actual component based on type T)
   */
  private _createComponentView() {
    return this._viewContainerRef.createComponent<T>(this._componentFactory, 0, this._injector);
  }
}
