import {
  Injector,
  EmbeddedViewRef,
  TemplateRef,
  ViewContainerRef,
  ComponentRef,
  ComponentFactoryResolver,
  Renderer2
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
    private _injector: Injector,
    private _renderer: Renderer2
  ) {
    this._componentFactory = this._componentFactoryResolver
      .resolveComponentFactory<T>(this._componentType);
  }

  /**
   * Create the component dynamically
   * @param content Template element to be inserted after the component view implementation
   */
  public createComponent(contents?: Array<TemplateRef<any> | string>): ComponentRef<T> {
    if (!this._componentRef) {
      let contentViewNodes: any[] = new Array();

      if (contents) {
        for (let content of contents) {
          let contentView = this._createContentView(content);
          contentViewNodes.push(contentView);
        }
      }

      this._componentRef = this._createComponentView(contentViewNodes);
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
  private _createContentView(content: TemplateRef<any> | string, context?: any): any[] {
    let elementNode: any[];

    if (content) {
      if (typeof content === 'string') {
        elementNode = new Array();
        elementNode.push(this._renderer.createText(content));
      } else {
        elementNode = this._viewContainerRef
          .createEmbeddedView(content as TemplateRef<T>, context)
          .rootNodes;
      }
    }

    return elementNode;
  }

  /**
   * Create Component view (Actual component based on type T)
   */
  private _createComponentView(ngContents?: any[]) {
    return this._viewContainerRef.createComponent<T>(
      this._componentFactory,
      0,
      this._injector,
      ngContents
    );
  }
}
