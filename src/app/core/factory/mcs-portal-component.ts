import {
  ViewContainerRef,
  Injector
} from '@angular/core';
import { McsComponentType } from '../interfaces/mcs-component-type.interface';

/**
 * Portal Component to create the component in DOM
 */
export class McsPortalComponent<T> {
  public component: McsComponentType<T>;
  public viewContainerRef?: ViewContainerRef;
  public injector?: Injector;

  constructor(
    component: McsComponentType<T>,
    viewContainerRef: ViewContainerRef,
    injector: Injector
  ) {
    this.component = component;
    this.viewContainerRef = viewContainerRef;
    this.injector = injector;
  }
}
