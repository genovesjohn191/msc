import {
  Injectable,
  ComponentFactoryResolver,
  ApplicationRef,
  NgZone
} from '@angular/core';
import { McsOverlayState } from '../factory/mcs-overlay-state';
import { McsOverlayRef } from '../factory/mcs-overlay-ref';
import { isNullOrEmpty } from '../../utilities';

/** Next overlay unique ID. */
let nextUniqueId = 0;

@Injectable()
export class McsOverlayService {

  private _containerElement: HTMLElement;

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _applicationRef: ApplicationRef,
    private _ngZone: NgZone
  ) {
    // Do something
  }

  /**
   * Create the overlay element and its component relation
   * @param state State to be used by inserting backdrop, attachment, etc...
   */
  public create(state?: McsOverlayState): McsOverlayRef {
    // Create the wrapper element to all the overlay components
    this._createWrapperElement();

    // Create 1 overlay element to each request for creation
    let overlay = this._createOverlayPane();

    // Return the Overlay Reference
    return new McsOverlayRef(
      overlay,
      state,
      this._componentFactoryResolver,
      this._applicationRef,
      this._ngZone
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
   * Create the overlay pane element
   */
  private _createOverlayPane(): HTMLElement {
    let pane = document.createElement('div');

    pane.id = `mcs-overlay-${nextUniqueId}`;
    pane.classList.add('mcs-overlay-pane');
    this._containerElement.appendChild(pane);
    return pane;
  }
}
