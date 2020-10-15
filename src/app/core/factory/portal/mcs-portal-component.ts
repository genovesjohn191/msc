import {
  Injector,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { McsComponentType } from '@app/utilities';

/**
 * Portal Component to create the component in DOM
 */
export class McsPortalComponent<T> {
  public component: McsComponentType<T>;
  public viewContainerRef?: ViewContainerRef;
  public templateRef: TemplateRef<any>;
  public injector?: Injector;

  constructor(
    component: McsComponentType<T>,
    viewContainerRef?: ViewContainerRef,
    templateRef?: TemplateRef<any>,
    injector?: Injector
  ) {
    this.component = component;
    this.viewContainerRef = viewContainerRef;
    this.templateRef = templateRef;
    this.injector = injector;
  }

  /**
   * Return the equivalent templateRef attachment nodes
   */
  public getAttachmentNodes(): any[] {
    // if (!this.viewContainerRef || !this.templateRef) { return undefined; }
    // let contentViewNodes: any[] = new Array();
    // let attachmentNodes = this.viewContainerRef
    //   .createEmbeddedView(this.templateRef as TemplateRef<T>)
    //   .rootNodes;

    // contentViewNodes.push(attachmentNodes);
    // return contentViewNodes;

    // TODO(apascual): Issue here https://github.com/angular/angular/issues/35412
    // Working Sample: https://ng-run.com/edit/pG94AVIEWn4rN2eA2rXT
    // Do not create the child elements using ViewContainerRef, instead, use the ComponentFactory

    if (!this.viewContainerRef || !this.templateRef) { return undefined; }
    let contentViewNodes: any[] = new Array();
    let attachmentNodes = this.viewContainerRef
      .createEmbeddedView(this.templateRef as TemplateRef<T>)
      .rootNodes;

    contentViewNodes.push(attachmentNodes);
    return contentViewNodes;

  }
}
