import {
  ViewContainerRef,
  Injector,
  TemplateRef
} from '@angular/core';
import { McsComponentType } from '../../interfaces/mcs-component-type.interface';

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
    if (!this.viewContainerRef || !this.templateRef) { return undefined; }
    let contentViewNodes: any[] = new Array();
    let attachmentNodes = this.viewContainerRef
      .createEmbeddedView(this.templateRef as TemplateRef<T>)
      .rootNodes;

    contentViewNodes.push(attachmentNodes);
    return contentViewNodes;
  }
}
