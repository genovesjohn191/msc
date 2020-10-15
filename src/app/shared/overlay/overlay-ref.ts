import { Subject } from 'rxjs';

import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injector,
  NgZone,
  TemplateRef
} from '@angular/core';
import {
  getElementPositionFromHost,
  getSafeProperty,
  isNullOrEmpty,
  registerEvent,
  McsAlignmentType,
  McsPlacementType
} from '@app/utilities';

import { PortalComponent } from '../portal-template/portal-component';
import { PortalTemplate } from '../portal-template/portal-template';
import { OverlayConfig } from './overlay-config';

/**
 * Overlay Reference class that supports the functionalities to attach and detach
 * a component or template from the given input
 */
export class OverlayRef {

  /**
   * Backdrop clicked stream
   *
   * `@Note:` You can listen to this event to reflect the functionailities you want to,
   * when the backdrop has been clicked
   */
  public backdropClickStream: Subject<any>;

  /** Other variables */
  private _backdropElement: HTMLElement;
  private _disposeFunc: (() => void) | null;

  constructor(
    private _overlayElementWrapper: HTMLElement,
    private _overlayElementItem: HTMLElement,
    private _overlayConfig: OverlayConfig,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _applicationRef: ApplicationRef,
    private _ngZone: NgZone,
    private _injector: Injector
  ) {
    this.backdropClickStream = new Subject<any>();
  }

  /**
   * Get the overlay element item created
   */
  public get overlayElementItem(): HTMLElement {
    return this._overlayElementItem;
  }

  /**
   * Attach the given ComponentPortal to DOM element using the ComponentFactoryResolver
   * @param portal Portal instance of the component to be created
   */
  public attachComponent<T>(portal: PortalComponent<T>): ComponentRef<T> {
    if (isNullOrEmpty(portal)) { return undefined; }

    let componentFactoryResolver = portal.componentFactoryResolver || this._componentFactoryResolver;
    let componentFactory = componentFactoryResolver.resolveComponentFactory(portal.component);
    let componentInjector = portal.injector || getSafeProperty(portal, obj => obj.viewContainerRef.injector);
    let componentRef: ComponentRef<T>;

    // Use the viewcontainerref of the component if specified, otherwise use the componentFactory
    if (portal.viewContainerRef) {
      let templateRootNodes = null;

      // This will be created only once the content of the portal host was defined, otherwise it will skipped
      if (!isNullOrEmpty(portal.templateRef)) {
        let templateRefDetails = portal.viewContainerRef.createEmbeddedView(portal.templateRef as TemplateRef<T>);
        templateRootNodes = [getSafeProperty(templateRefDetails, obj => obj.rootNodes)];
      }

      componentRef = portal.viewContainerRef.createComponent(
        componentFactory,
        portal.viewContainerRef.length,
        componentInjector,
        templateRootNodes
      );

      this._setDisposeFunc(() => componentRef.destroy());
    } else {
      componentRef = componentFactory.create(portal.injector || this._injector);
      this._applicationRef.attachView(componentRef.hostView);

      this._setDisposeFunc(() => {
        this._applicationRef.detachView(componentRef.hostView);
        componentRef.destroy();
      });
    }

    // Append the component root nodes to the overlay element as host
    this._overlayElementItem.appendChild(
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
  public attachTemplate<C>(portal: PortalTemplate<C>): EmbeddedViewRef<C> {
    if (isNullOrEmpty(portal)) { return undefined; }

    let viewContainer = portal.viewContainerRef;
    let viewRef = viewContainer.createEmbeddedView(portal.templateRef, portal.context);
    viewRef.detectChanges();

    // Add all the rootnodes of the created embeddedview and append it as a child
    viewRef.rootNodes.forEach((rootNode) => this.overlayElementItem.appendChild(rootNode));
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

    this._overlayElementItem.appendChild(element);

    // Add attachment's settings
    this._setAttachmentSettings();
    return element;
  }

  /**
   * Move the element at the specified position based on its host provided and placement
   * @param hostElement Host element that serves as the basis of the position
   * @param placement Placement of the element, Left, Top, Right, Bottom
   */
  public moveElementTo(hostElement: HTMLElement, placement: McsPlacementType): void {
    if (isNullOrEmpty(hostElement)) { return; }

    let elementPosition = getElementPositionFromHost(
      hostElement, this._overlayElementItem, `${placement}-center`, true
    );
    this._overlayElementItem.style.top = `${elementPosition.top}px`;
    this._overlayElementItem.style.left = `${elementPosition.left}px`;
  }

  /**
   * Move the element based on global position that is currently displayed on the view port
   * @param placement Placement of the element, center, left, top, bottom
   */
  public moveElementToGlobal(
    placement?: McsPlacementType,
    alignment: McsAlignmentType = 'center',
    customClass?: string
  ): void {
    if (isNullOrEmpty(this._overlayElementItem)) { return; }
    placement === 'center' ?
      this._overlayElementItem.classList.add(placement) :
      this._overlayElementItem.classList.add(`${placement}-${alignment}`);

    if (!isNullOrEmpty(customClass)) {
      this._overlayElementItem.classList.add(customClass);
    }
  }

  /**
   * Detach the element from the overlay
   */
  public detach(): void {
    this.detachBackdrop();

    // Remove the pointer events of the attachment
    if (this._overlayConfig.pointerEvents) {
      this._overlayElementItem.style.pointerEvents = 'none';
    }

    // Remove the current item of the overlay
    let hasParentElement = !isNullOrEmpty(this._overlayElementWrapper)
      && !isNullOrEmpty(this._overlayElementWrapper.parentElement);
    if (hasParentElement) {
      this._overlayElementWrapper.parentElement.removeChild(this._overlayElementWrapper);
    }

    // Remove the current overlay after detaching the background
    if (!isNullOrEmpty(this.overlayElementItem.parentNode)) {
      this.overlayElementItem.parentNode.removeChild(this._overlayElementItem);
    }
  }

  /**
   * Detaches the backdrop of this overlay
   */
  public detachBackdrop(): void {
    if (isNullOrEmpty(this._backdropElement)) { return; }

    let finishDetach = () => {
      if (this._backdropElement.parentNode) {
        this._backdropElement.parentNode.removeChild(this._backdropElement);
      }
    };
    // Set the styling of backdrop including the fadeIn effect
    registerEvent(this._backdropElement, 'animationEnd', finishDetach);
    this._backdropElement.classList.remove('fadeIn');
    this._backdropElement.classList.add('fadeOut');
    this._backdropElement.style.pointerEvents = 'none';
    // Run the detaching outside angular to make sure the finishDetach method will be called
    this._ngZone.runOutsideAngular(() => {
      setTimeout(finishDetach, 500);
    });
  }

  /**
   * This will dispose all the resource of the overlay reference
   */
  public dispose(): void {
    // Remove all the attached from the overlay
    if (!isNullOrEmpty(this._disposeFunc)) {
      this._disposeFunc();
      this._disposeFunc = null;
    }
    this.detach();
    this.backdropClickStream.complete();
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
    if (this._overlayConfig.pointerEvents) {
      this._overlayElementItem.style.pointerEvents = this._overlayConfig.pointerEvents;
    }
    // Add the backdrop if it is necessary
    if (this._overlayConfig.hasBackdrop) {
      this._attachBackdrop();
    }
  }

  /**
   * Attaches a backdrop to the overlay element
   */
  private _attachBackdrop(): void {
    this._backdropElement = document.createElement('div');
    this._backdropElement.classList.add('mcs-overlay-backdrop');
    this._backdropElement.classList.add('animation');

    this._setBackdropColor();
    this._overlayElementItem.parentElement.insertBefore(
      this._backdropElement,
      this._overlayElementItem
    );
    registerEvent(this._backdropElement, 'click', () => this.backdropClickStream.next(null));

    // Add class to fade-in the backdrop after one frame.
    requestAnimationFrame(() => {
      if (this._backdropElement) {
        this._backdropElement.classList.add('fadeIn');
      }
    });
  }

  /**
   * Set the backdropcolor based on the style settings
   */
  private _setBackdropColor(): void {
    if (isNullOrEmpty(this._overlayConfig)) { return; }

    switch (this._overlayConfig.backdropColor) {
      case 'light':
        this._backdropElement.classList.add('light-backdrop');
        break;

      case 'dark':
        this._backdropElement.classList.add('dark-backdrop');
        break;

      case 'black':
        this._backdropElement.classList.add('black-backdrop');
        break;

      case 'none':
      default:
        this._backdropElement.classList.add('transparent-backdrop');
        break;
    }
  }
}
