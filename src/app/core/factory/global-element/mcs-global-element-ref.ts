import {
  ComponentFactoryResolver,
  ApplicationRef,
  ComponentRef,
  EmbeddedViewRef,
  Injector
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  isNullOrEmpty,
  getElementPositionFromHost,
  unsubscribeSafely
} from '../../../utilities';
import { McsGlobalElementOption } from './mcs-global-element-option';
import { McsPortalComponent } from '../portal/mcs-portal-component';
import { McsPortalTemplate } from '../portal/mcs-portal-template';
import { McsScrollDispatcherService } from '../../services/mcs-scroll-dispatcher.service';

// placement type enumerations
type PlacementAttribute = {
  hostElement: HTMLElement;
  placement: string;
  offset?: number;
};

export class McsGlobalElementRef {

  private _disposeFunc: (() => void) | null;
  private _scrollSubscription: Subscription;
  private _relativePlacement: PlacementAttribute;

  constructor(
    private _globalElementItem: HTMLElement,
    private _globalElementOption: McsGlobalElementOption,
    private _scrollDispatcher: McsScrollDispatcherService,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _applicationRef: ApplicationRef,
    private _injector: Injector
  ) { }

  /**
   * Returns the global element item panel instance
   */
  public get globalElementItem(): HTMLElement {
    return this._globalElementItem;
  }

  /**
   * Attach the given ComponentPortal to DOM element using the ComponentFactoryResolver
   * @param portal Portal instance of the component to be created
   */
  public attachComponent<T>(portal: McsPortalComponent<T>): ComponentRef<T> {
    if (isNullOrEmpty(portal)) { return undefined; }

    let componentFactory = this._componentFactoryResolver.resolveComponentFactory(portal.component);
    let componentRef: ComponentRef<T>;

    // Use the viewcontainerref of the component if specified, otherwise use the componentFactory
    if (portal.viewContainerRef) {
      componentRef = portal.viewContainerRef.createComponent(
        componentFactory,
        portal.viewContainerRef.length,
        portal.injector || portal.viewContainerRef.parentInjector,
        portal.getAttachmentNodes()
      );
      this._setDisposeFunc(() => componentRef.destroy());
    } else {
      componentRef = componentFactory.create(
        portal.injector || this._injector);
      this._applicationRef.attachView(componentRef.hostView);
      this._setDisposeFunc(() => {
        this._applicationRef.detachView(componentRef.hostView);
        componentRef.destroy();
      });
    }

    // Append the component root nodes to the global element element as host
    this._globalElementItem.appendChild(
      (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement
    );

    // Add attachment's settings
    this._setAttachmentSettings();
    return componentRef;
  }

  /**
   * Attaches a template portal to the DOM as an embedded view.
   * @param portal Portal to be attached.
   */
  public attachTemplate<C>(portal: McsPortalTemplate<C>): EmbeddedViewRef<C> {
    if (isNullOrEmpty(portal)) { return undefined; }

    let viewContainer = portal.viewContainerRef;
    let viewRef = viewContainer.createEmbeddedView(portal.templateRef, portal.context);
    viewRef.detectChanges();

    // Add all the rootnodes of the created embeddedview and append it as a child
    viewRef.rootNodes.forEach((rootNode) => this._globalElementItem.appendChild(rootNode));
    this._setDisposeFunc((() => {
      let index = viewContainer.indexOf(viewRef);
      if (index !== -1) {
        viewContainer.remove(index);
      }
    }));

    // Add attachment's settings
    this._setAttachmentSettings();
    return viewRef;
  }

  /**
   * Attaches a element to the DOM
   * @param element The element to be attached
   */
  public attachElement(element: HTMLElement): HTMLElement {
    if (isNullOrEmpty(element)) { return; }

    this._globalElementItem.appendChild(element);

    // Add attachment's settings
    this._setAttachmentSettings();
    return element;
  }

  /**
   * Move the element at the specified position based on its host provided and placement
   * @param hostElement Host element that serves as the basis of the position
   * @param placement Placement of the element, Left, Top, Right, Bottom
   * @param _offset Offset of the element based on its placement
   */
  public moveElementTo(placementAttribute: PlacementAttribute): void {
    if (isNullOrEmpty(placementAttribute)) { return; }
    this._relativePlacement = placementAttribute;
    let elementPosition = getElementPositionFromHost(
      placementAttribute.hostElement, this._globalElementItem, placementAttribute.placement, true
    );
    this._globalElementItem.style.top = `${elementPosition.top}px`;
    this._globalElementItem.style.left = `${elementPosition.left}px`;
    this._globalElementItem.classList.add(`${placementAttribute.placement}-center`);
  }

  /**
   * Detaches the element from the global element manually
   */
  public detach(): void {
    // Remove the pointer events of the attachment
    if (this._globalElementOption.pointerEvents) {
      this._globalElementItem.style.pointerEvents = 'none';
    }

    // Remove the current global element item after detaching the background
    if (!isNullOrEmpty(this._globalElementItem.parentNode)) {
      this._globalElementItem.parentNode.removeChild(this._globalElementItem);
    }
  }

  /**
   * Disposes all the resources of the global element reference
   */
  public dispose(): void {
    // Unsubscribe to any subscription
    unsubscribeSafely(this._scrollSubscription);
    // Remove all the attached from the global element
    if (!isNullOrEmpty(this._disposeFunc)) {
      this._disposeFunc();
      this._disposeFunc = null;
    }
    this.detach();
  }

  /**
   * Set dispose function to be called in dispose method
   * @param fn Function to register
   */
  private _setDisposeFunc(fn: () => void): void {
    this._disposeFunc = fn;
  }

  /**
   * Set the attachment settings of all common settings
   */
  private _setAttachmentSettings(): void {
    // Set the pointer events of the attachment
    if (this._globalElementOption.pointerEvents) {
      this._globalElementItem.style.pointerEvents = this._globalElementOption.pointerEvents;
    }
    this._listenToScrollChanged();
  }

  /**
   * Listens to every scroll changed to update the display position of the global element item
   */
  private _listenToScrollChanged(): void {
    unsubscribeSafely(this._scrollSubscription);
    this._scrollSubscription = this._scrollDispatcher.scrolled(0, () => {
      if (isNullOrEmpty(this._relativePlacement)) { return; }
      this.moveElementTo(this._relativePlacement);
    });
  }
}
