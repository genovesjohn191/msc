import {
  Injectable,
  TemplateRef,
  ComponentRef,
  Injector,
  InjectionToken,
  ReflectiveInjector,
} from '@angular/core';
import { Subject } from 'rxjs';
import {
  isNullOrEmpty,
  clearArrayRecord,
  McsComponentType
} from '@app/utilities';
import { McsOverlayService } from './mcs-overlay.service';
import { McsOverlayRef } from '../factory/overlay/mcs-overlay-ref';
import { McsOverlayState } from '../factory/overlay/mcs-overlay-state';
import { McsPortalComponent } from '../factory/portal/mcs-portal-component';
import { McsPortalTemplate } from '../factory/portal/mcs-portal-template';
import { McsSnackBarRef } from '../factory/snack-bar/mcs-snack-bar-ref';
import { McsSnackBarConfig } from '../factory/snack-bar/mcs-snack-bar-config';
import {
  McsSnackBarContainerComponent
} from '../factory/snack-bar/mcs-snack-bar-container.component';

// Injection token definition list for snackbar
export const MCS_SNACKBAR_DATA = new InjectionToken<any>('McsSnackBarData');
export const MCS_SNACKBAR_CONTAINER = new InjectionToken<any>('McsSnackBarContainerComponent');

@Injectable()
export class McsSnackBarService {
  /**
   * Stream that emits when snack bar has been opened.
   */
  public afterOpen: Subject<McsSnackBarRef<any>>;

  // Other variables
  private _openedSnackBars: Array<McsSnackBarRef<any>>;

  constructor(private _overlayService: McsOverlayService) {
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
    config: McsSnackBarConfig = new McsSnackBarConfig()
  ): McsSnackBarRef<T> {

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
  private _createOverlay(_config: McsSnackBarConfig): McsOverlayRef {
    let overlayState = new McsOverlayState();
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
    overlay: McsOverlayRef,
    config: McsSnackBarConfig
  ): McsSnackBarContainerComponent {

    let containerPortal = new McsPortalComponent(
      McsSnackBarContainerComponent, config.viewContainerRef
    );
    let containerRef: ComponentRef<McsSnackBarContainerComponent> =
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
    snackBarContainer: McsSnackBarContainerComponent,
    overlayRef: McsOverlayRef,
    config: McsSnackBarConfig
  ): McsSnackBarRef<T> {

    // Create a reference to the snackbar we're creating in order to give the user a handle
    // to modify and close it.
    let snackBarRef = new McsSnackBarRef<any>(overlayRef, snackBarContainer, config.id);

    // Attach component, template or string based on portal type
    if (portal instanceof TemplateRef) {

      let templateRef = snackBarContainer.attachTemplate(new McsPortalTemplate(portal, null!));
      snackBarRef.portalInstance = templateRef;
    } else if (typeof portal === 'string') {

      let messageInstance = snackBarContainer.attachMessage(portal as string);
      snackBarRef.portalInstance = messageInstance;
    } else {

      let injector = this._createInjector<T>(config, snackBarRef, snackBarContainer);
      let componentRef = snackBarContainer.attachComponent(
        new McsPortalComponent(portal, undefined, undefined, injector)
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
    config: McsSnackBarConfig,
    snackBarRef: McsSnackBarRef<T>,
    snackBarContainer: McsSnackBarContainerComponent
  ): Injector {

    return ReflectiveInjector.resolveAndCreate([
      { provide: McsSnackBarRef, useValue: snackBarRef },
      { provide: MCS_SNACKBAR_CONTAINER, useValue: snackBarContainer },
      { provide: MCS_SNACKBAR_DATA, useValue: config.data }
    ]);
  }

  /**
   * Removes a snack-bar from the array of open snack-bars.
   * @param snackBarRef snack-bar to be removed.
   */
  private _removeOpenedSnackbar(snackBarRef: McsSnackBarRef<any>) {
    const index = this._openedSnackBars.indexOf(snackBarRef);
    // Remove the snack bar
    if (index > -1) { this._openedSnackBars.splice(index, 1); }
  }
}
