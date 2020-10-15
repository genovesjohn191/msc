import {
  ComponentFactoryResolver,
  Injector,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { McsComponentType } from '@app/utilities';

/**
 * Portal Component to create the component in DOM
 */
export class PortalComponent<T> {
  public component: McsComponentType<T>;
  public viewContainerRef?: ViewContainerRef;
  public templateRef: TemplateRef<any>;
  public injector?: Injector;
  public componentFactoryResolver?: ComponentFactoryResolver | null;

  constructor(
    component: McsComponentType<T>,
    viewContainerRef?: ViewContainerRef,
    templateRef?: TemplateRef<any>,
    injector?: Injector,
    componentFactoryResolver?: ComponentFactoryResolver | null
  ) {
    this.component = component;
    this.viewContainerRef = viewContainerRef;
    this.templateRef = templateRef;
    this.injector = injector;
    this.componentFactoryResolver = componentFactoryResolver;
  }
}
