import {
  ViewContainerRef,
  TemplateRef
} from '@angular/core';

/**
 * Portal Template to create the template reference in DOM
 */
export class McsPortalTemplate<C> {
  public templateRef: TemplateRef<C>;
  public viewContainerRef: ViewContainerRef;
  public context: C;

  constructor(
    template: TemplateRef<any>,
    viewContainerRef: ViewContainerRef,
    context?: C
  ) {
    this.templateRef = template;
    this.viewContainerRef = viewContainerRef;
    this.context = context;
  }
}
