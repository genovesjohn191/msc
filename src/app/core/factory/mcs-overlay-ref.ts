import {
  ComponentFactoryResolver,
  ApplicationRef,
  ComponentRef,
  EmbeddedViewRef,
  NgZone
} from '@angular/core';
import { Subject } from 'rxjs/Rx';
import {
  isNullOrEmpty,
  registerEvent,
  getElementPositionFromHost
} from '../../utilities';
import { McsOverlayState } from './mcs-overlay-state';
import { McsPortalComponent } from './mcs-portal-component';
import { McsPortalTemplate } from './mcs-portal-template';

/**
 * Overlay Reference class that supports the functionalities to attach and detach
 * a component or template from the given input
 */
export class McsOverlayRef {

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
    private _overlayPane: HTMLElement,
    private _overlayState: McsOverlayState,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _applicationRef: ApplicationRef,
    private _ngZone: NgZone
  ) {
    this.backdropClickStream = new Subject<any>();
  }

  /**
   * Get the overlay pane element created
   */
  public get overlayPane(): HTMLElement {
    return this._overlayPane;
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
      componentRef = componentFactory.create(portal.injector);
      this._applicationRef.attachView(componentRef.hostView);
      this._setDisposeFunc(() => {
        this._applicationRef.detachView(componentRef.hostView);
        componentRef.destroy();
      });
    }

    // Append the component root nodes to the overlay element as host
    this._overlayPane.appendChild(
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
    viewRef.rootNodes.forEach((rootNode) => this.overlayPane.appendChild(rootNode));
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

    this._overlayPane.appendChild(element);

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
  public moveElementTo(hostElement: HTMLElement, placement: string, _offset: number = 2): void {
    if (isNullOrEmpty(hostElement)) { return; }

    let elementPosition = getElementPositionFromHost(
      hostElement, this._overlayPane, placement, true
    );

    // TODO: Add listener to scroll changes to update the position of the target element
    this._overlayPane.style.top = `${elementPosition.top}px`;
    this._overlayPane.style.left = `${elementPosition.left}px`;
  }

  /**
   * Detach the element from the overlay
   */
  public detach(): void {
    this._detachBackdrop();

    // Remove the pointer events of the attachment
    if (this._overlayState.pointerEvents) {
      this._overlayPane.style.pointerEvents = 'none';
    }
    // Remove the current overlay after detaching the background
    if (!isNullOrEmpty(this.overlayPane.parentNode)) {
      this.overlayPane.parentNode.removeChild(this._overlayPane);
    }
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
    if (this._overlayState.pointerEvents) {
      this._overlayPane.style.pointerEvents = this._overlayState.pointerEvents;
    }
    // Add the backdrop if it is necessary
    if (this._overlayState.hasBackdrop) {
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
    this._overlayPane.parentElement!.insertBefore(this._backdropElement, this._overlayPane);
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
    if (isNullOrEmpty(this._overlayState)) { return; }

    switch (this._overlayState.backdropColor) {
      case 'light':
        this._backdropElement.classList.add('light-backdrop');
        break;

      case 'dark':
        this._backdropElement.classList.add('dark-backdrop');
        break;

      case 'none':
      default:
        this._backdropElement.classList.add('transparent-backdrop');
        break;
    }
  }

  /**
   * Detaches the backdrop of this overlay
   */
  private _detachBackdrop(): void {
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
}
