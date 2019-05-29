import {
  Injectable,
  ComponentFactoryResolver,
  ApplicationRef,
  NgZone,
  Injector
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';
import { McsUniqueId } from '@app/core';
import { OverlayRef } from './overlay-ref';
import { OverlayConfig } from './overlay-config';

@Injectable()
export class OverlayService {

  private _containerElement: HTMLElement;

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _applicationRef: ApplicationRef,
    private _ngZone: NgZone,
    private _injector: Injector
  ) { }

  /**
   * Create the overlay element and its component relation
   * @param config Configuration to be used by inserting backdrop, attachment, etc...
   */
  public create(config?: OverlayConfig): OverlayRef {
    // Create the wrapper element to all the overlay components
    this._createWrapperElement();

    // Create the global wrapper for each item
    let itemWrapper = this._createWrapperItem(config.hasBackdrop);

    // Create 1 overlay element to each request for creation
    let overlay = this._createOverlayPane(itemWrapper);

    // Return the Overlay Reference
    return new OverlayRef(
      itemWrapper,
      overlay,
      config,
      this._componentFactoryResolver,
      this._applicationRef,
      this._ngZone,
      this._injector
    );
  }

  /**
   * Create the wrapper of the overlay element that holds all the overlay pane
   */
  private _createWrapperElement(): HTMLElement {
    if (!isNullOrEmpty(this._containerElement)) { return; }
    let container = document.createElement('div');

    container.classList.add('mcs-overlay-wrapper');
    document.body.appendChild(container);
    this._containerElement = container;
    return container;
  }

  /**
   * Create the wrapper item for each overlay if the state has backdrop
   * @param hasbackDrop Backdrop flag
   */
  private _createWrapperItem(hasbackDrop: boolean): HTMLElement {
    if (!hasbackDrop) { return undefined; }
    let itemContainer = document.createElement('div');

    itemContainer.classList.add('mcs-overlay-item-wrapper');
    this._containerElement.appendChild(itemContainer);
    return itemContainer;
  }

  /**
   * Create the overlay pane element
   */
  private _createOverlayPane(itemWrapper: HTMLElement): HTMLElement {
    let pane = document.createElement('div');

    pane.id = McsUniqueId.NewId('overlay');
    pane.classList.add('mcs-overlay-pane');
    itemWrapper ? itemWrapper.appendChild(pane) :
      this._containerElement.appendChild(pane);
    return pane;
  }
}
