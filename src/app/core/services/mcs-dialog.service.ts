import {
  Injectable,
  TemplateRef,
  ComponentRef,
  Injector,
  InjectionToken,
  ReflectiveInjector
} from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { McsOverlayRef } from '../factory/overlay/mcs-overlay-ref';
import { McsOverlayState } from '../factory/overlay/mcs-overlay-state';
import { McsPortalComponent } from '../factory/portal/mcs-portal-component';
import { McsPortalTemplate } from '../factory/portal/mcs-portal-template';
import { McsOverlayService } from './mcs-overlay.service';
import { McsComponentType } from '../interfaces/mcs-component-type.interface';
import { McsDialogRef } from '../factory/dialog/mcs-dialog-ref';
import { McsDialogConfig } from '../factory/dialog/mcs-dialog-config';
import { McsDialogContainerComponent } from '../factory/dialog/mcs-dialog-container.component';
import {
  isNullOrEmpty,
  registerEvent,
  unregisterEvent
} from '../../utilities';
import { Key } from '../../core';

// Injection token definition list for dialog
export const MCS_DIALOG_DATA = new InjectionToken<any>('McsDialogData');
export const MCS_DIALOG_CONTAINER = new InjectionToken<any>('McsDialogContainerComponent');

@Injectable()
export class McsDialogService {
  /**
   * Stream that emits when dialog has been opened.
   */
  public afterOpen: Subject<McsDialogRef<any>>;

  // Other variables
  private _onKeyDownEventHandler = this._onKeyDown.bind(this);
  private _openDialogs: Array<McsDialogRef<any>>;

  constructor(private _overlayService: McsOverlayService) {
    this.afterOpen = new Subject();
    this._openDialogs = new Array();
  }

  /**
   * Open/Create a modal dialog containing the given component
   * @param portal Type of dialog to be created
   * @param config Configuration of the dialog
   */
  public open<T>(
    portal: McsComponentType<T> | TemplateRef<T>,
    config: McsDialogConfig = new McsDialogConfig()
  ): McsDialogRef<T> {

    // Check weather the dialog is opened or not
    let dialogExist = this._openDialogs.find((dialog) => {
      return dialog.id === config.id;
    });
    if (dialogExist) { return dialogExist; }

    config.hasBackdrop = isNullOrEmpty(config.hasBackdrop) ? true : config.hasBackdrop;
    config.backdropColor = isNullOrEmpty(config.backdropColor) ? 'dark' : config.backdropColor;

    let overlayRef = this._createOverlay(config);
    let dialogContainer = this._attachDialogContainer(overlayRef, config);
    let dialogRef = this._attachDialogContent(portal, dialogContainer, overlayRef, config);

    if (!this._openDialogs.length) {
      registerEvent(document, 'keydown', this._onKeyDownEventHandler);
    }
    this._openDialogs.push(dialogRef);
    dialogRef.afterClosed().subscribe(() => this._removeOpenDialog(dialogRef));
    this.afterOpen.next(dialogRef);

    return dialogRef;
  }

  /**
   * Closes all of the currently-open dialogs.
   */
  public closeAll(): void {
    if (isNullOrEmpty(this._openDialogs)) { return; }
    this._openDialogs.forEach((dialogRef) => {
      dialogRef.close();
    });
    this._openDialogs.splice(0);
  }

  /**
   * Create the overlay of the dialog
   * @param config Configuration of the dialog
   */
  private _createOverlay(config: McsDialogConfig): McsOverlayRef {
    let overlayState = new McsOverlayState();
    overlayState.hasBackdrop = config.hasBackdrop;
    overlayState.backdropColor = config.backdropColor;
    overlayState.pointerEvents = 'auto';

    let overlayRef = this._overlayService.create(overlayState);
    overlayRef.moveElementToGlobal('center');
    return overlayRef;
  }

  /**
   * Attaches the dialog component/container to the overlay
   * @param overlay Overlay Element of the dialog
   * @param config Configuration of the dialog
   */
  private _attachDialogContainer(
    overlay: McsOverlayRef,
    config: McsDialogConfig
  ): McsDialogContainerComponent {

    let containerPortal = new McsPortalComponent(
      McsDialogContainerComponent, config.viewContainerRef
    );
    let containerRef: ComponentRef<McsDialogContainerComponent> =
      overlay.attachComponent(containerPortal);
    containerRef.instance.dialogConfig = config;

    return containerRef.instance;
  }

  /**
   * Attaches the dialog content that might be template or component
   *
   * `@Note:` This will return undefined when the dialog is already displayed
   * @param portal Portal type to be created
   * @param dialogContainer Dialog container/component where the content will be attached
   * @param overlayRef Overlay reference that was created previously
   * @param config Configuration of the dialog
   */
  private _attachDialogContent<T>(
    portal: McsComponentType<T> | TemplateRef<T>,
    dialogContainer: McsDialogContainerComponent,
    overlayRef: McsOverlayRef,
    config: McsDialogConfig
  ): McsDialogRef<T> {

    // Create a reference to the dialog we're creating in order to give the user a handle
    // to modify and close it.
    let dialogRef = new McsDialogRef<T>(overlayRef, dialogContainer, config.id);

    // Close the dialog when the backdrop is click or outside the dialog component
    if (config.hasBackdrop) {
      overlayRef.backdropClickStream.subscribe(() => {
        if (!config.disableClose) {
          dialogRef.close();
        }
      });
    }

    // Attach component or template based on portal type
    if (portal instanceof TemplateRef) {
      dialogContainer.attachTemplate(new McsPortalTemplate(portal, null!, { data: config.data }));
    } else {
      let injector = this._createInjector<T>(config, dialogRef, dialogContainer);
      let contentRef = dialogContainer.attachComponent(
        new McsPortalComponent(portal, undefined, undefined, injector)
      );
      dialogRef.componentInstance = contentRef.instance;
    }

    // Do the update position here
    dialogRef.updateSize(config.size, config.width, config.height);
    return dialogRef;
  }

  /**
   * Create the injectors of the dialog that can be used externally
   * @param config Configuration of the dialog
   * @param dialogRef Dialog Reference
   * @param dialogContainer Dialog container
   */
  private _createInjector<T>(
    config: McsDialogConfig,
    dialogRef: McsDialogRef<T>,
    dialogContainer: McsDialogContainerComponent
  ): Injector {

    return ReflectiveInjector.resolveAndCreate([
      { provide: McsDialogRef, useValue: dialogRef },
      { provide: MCS_DIALOG_CONTAINER, useValue: dialogContainer },
      { provide: MCS_DIALOG_DATA, useValue: config.data }
    ]);
  }

  /**
   * Event that emits when key is pressed
   * @param event Event type
   */
  private _onKeyDown(event: KeyboardEvent): void {
    if (isNullOrEmpty(this._openDialogs)) { return; }

    if (event.keyCode === Key.Escape) {
      let topDialog = this._openDialogs[this._openDialogs.length - 1];
      if (!topDialog.disableClose) {
        topDialog.close();
      }
    }
  }

  /**
   * Removes a dialog from the array of open dialogs.
   * @param dialogRef Dialog to be removed.
   */
  private _removeOpenDialog(dialogRef: McsDialogRef<any>) {
    const index = this._openDialogs.indexOf(dialogRef);

    // Remove the top dialog
    if (index > -1) {
      this._openDialogs.splice(index, 1);
      if (!this._openDialogs.length) {
        unregisterEvent(document, 'keydown', this._onKeyDownEventHandler);
      }
    }
  }
}
