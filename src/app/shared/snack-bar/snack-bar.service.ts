import { Subject } from 'rxjs';

import {
  ComponentRef,
  Injectable,
  InjectionToken,
  Injector,
  TemplateRef
} from '@angular/core';
import {
  clearArrayRecord,
  isNullOrEmpty,
  McsComponentType
} from '@app/utilities';

import {
  OverlayConfig,
  OverlayRef,
  OverlayService
} from '../overlay';
import {
  PortalComponent,
  PortalTemplate
} from '../portal-template';
import { SnackBarConfig } from './snack-bar-config';
import { SnackBarContainerComponent } from './snack-bar-container/snack-bar-container.component';
import { SnackBarRef } from './snack-bar-ref/snack-bar-ref';

// Injection token definition list for snackbar
export const SNACKBAR_DATA = new InjectionToken<any>('SnackBarData');
export const SNACKBAR_CONTAINER = new InjectionToken<any>('SnackBarContainerComponent');

@Injectable()
export class SnackBarService {
  /**
   * Stream that emits when snack bar has been opened.
   */
  public afterOpen: Subject<SnackBarRef<any>>;

  // Other variables
  private _openedSnackBars: Array<SnackBarRef<any>>;

  constructor(private _overlayService: OverlayService) {
    this.afterOpen = new Subject();
    this._openedSnackBars = new Array();
  }

  /**
   * Open/Create a snack-bar containing the given component
   * @param portal Type of snack-bar to be created
   * @param config Configuration of the snack-bar
   */
  public open<T>(
    portal: McsComponentType<T> | TemplateRef<T> | string,
    config: SnackBarConfig = new SnackBarConfig()
  ): SnackBarRef<T> {

    // Check weather the snackbar is opened or not
    let snackBarExist = this._openedSnackBars.find((snackbar) => {
      return snackbar.id === config.id;
    });
    if (snackBarExist) { return snackBarExist; }

    // Create overlay
    let overlayRef = this._createOverlay(config);
    let snackBarContainer = this._attachSnackBarContainer(overlayRef, config);
    let snackBarRef = this._attachSnackBarContent(portal, snackBarContainer, overlayRef, config);

    this._openedSnackBars.push(snackBarRef);
    snackBarRef.afterClosed().subscribe(() => this._removeOpenedSnackbar(snackBarRef));
    snackBarRef.afterOpened().subscribe(() => snackBarRef.closeAfter(config.duration));
    this.afterOpen.next(snackBarRef);

    return snackBarRef;
  }

  /**
   * Closes all of the currently-open snackbars.
   */
  public closeAll(): void {
    if (isNullOrEmpty(this._openedSnackBars)) { return; }
    this._openedSnackBars.forEach((snackBarRef) => snackBarRef.close());
    clearArrayRecord(this._openedSnackBars);
  }

  /**
   * Create the overlay of the snackbar
   * @param config Configuration of the snackbar
   */
  private _createOverlay(_config: SnackBarConfig): OverlayRef {
    let overlayState = new OverlayConfig();
    overlayState.pointerEvents = 'auto';
    overlayState.hasBackdrop = false;
    overlayState.backdropColor = 'none';

    let overlayRef = this._overlayService.create(overlayState);
    overlayRef.moveElementToGlobal(
      _config.verticalPlacement,
      _config.horizontalAlignment,
      'padding-large');

    return overlayRef;
  }

  /**
   * Attaches the snack-bar component/container to the overlay
   * @param overlay Overlay Element of the snack-bar
   * @param config Configuration of the snack-bar
   */
  private _attachSnackBarContainer(
    overlay: OverlayRef,
    config: SnackBarConfig
  ): SnackBarContainerComponent {

    let containerPortal = new PortalComponent(
      SnackBarContainerComponent, config.viewContainerRef
    );
    let containerRef: ComponentRef<SnackBarContainerComponent> =
      overlay.attachComponent(containerPortal);
    containerRef.instance.snackBarConfig = config;

    return containerRef.instance;
  }

  /**
   * Attaches the snack-bar content that might be template or component
   *
   * `@Note:` This will return undefined when the snack-bar is already displayed
   * @param portal Portal type to be created
   * @param snackBarContainer snack-bar container/component where the content will be attached
   * @param overlayRef Overlay reference that was created previously
   * @param config Configuration of the snack-bar
   */
  private _attachSnackBarContent<T>(
    portal: McsComponentType<T> | TemplateRef<T> | string,
    snackBarContainer: SnackBarContainerComponent,
    overlayRef: OverlayRef,
    config: SnackBarConfig
  ): SnackBarRef<T> {

    // Create a reference to the snackbar we're creating in order to give the user a handle
    // to modify and close it.
    let snackBarRef = new SnackBarRef<any>(overlayRef, snackBarContainer, config.id);

    // Attach component, template or string based on portal type
    if (portal instanceof TemplateRef) {

      let templateRef = snackBarContainer.attachTemplate(new PortalTemplate(portal, null));
      snackBarRef.portalInstance = templateRef;
    } else if (typeof portal === 'string') {

      let messageInstance = snackBarContainer.attachMessage(portal as string);
      snackBarRef.portalInstance = messageInstance;
    } else {

      let injector = this._createInjector<T>(config, snackBarRef, snackBarContainer);
      let componentRef = snackBarContainer.attachComponent(
        new PortalComponent(portal, undefined, undefined, injector)
      );
      snackBarRef.portalInstance = componentRef.instance;
    }

    // Do the update position here
    return snackBarRef;
  }

  /**
   * Create the injectors of the snack-bar that can be used externally
   * @param config Configuration of the snack-bar
   * @param snackBarRef Snack Bar Reference
   * @param snackBarContainer Snack Bar container
   */
  private _createInjector<T>(
    config: SnackBarConfig,
    snackBarRef: SnackBarRef<T>,
    snackBarContainer: SnackBarContainerComponent
  ): Injector {

    return Injector.create({
      providers: [
        { provide: SnackBarRef, useValue: snackBarRef },
        { provide: SNACKBAR_CONTAINER, useValue: snackBarContainer },
        { provide: SNACKBAR_DATA, useValue: config.data }
      ]
    });
  }

  /**
   * Removes a snack-bar from the array of open snack-bars.
   * @param snackBarRef snack-bar to be removed.
   */
  private _removeOpenedSnackbar(snackBarRef: SnackBarRef<any>) {
    const index = this._openedSnackBars.indexOf(snackBarRef);
    // Remove the snack bar
    if (index > -1) { this._openedSnackBars.splice(index, 1); }
  }
}
