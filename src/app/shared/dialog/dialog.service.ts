import { Subject } from 'rxjs';

import {
  ComponentRef,
  Injectable,
  Injector,
  TemplateRef
} from '@angular/core';
import {
  isNullOrEmpty,
  registerEvent,
  unregisterEvent,
  KeyboardKey,
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
import {
  DialogConfig,
  DIALOG_CONTAINER,
  DIALOG_DATA
} from './dialog-config';
import { DialogConfirmation } from './dialog-confirmation/dialog-confirmation-data';
import { DialogConfirmationComponent } from './dialog-confirmation/dialog-confirmation.component';
import { DialogContainerComponent } from './dialog-container/dialog-container.component';
import { DialogMessageConfig } from './dialog-message/dialog-message-config';
import { DialogMessageComponent } from './dialog-message/dialog-message.component';
import { DialogRef } from './dialog-ref/dialog-ref';

/**
 * @deprecated Do not use this anymore. Use the DialogService2 instead.
 */
@Injectable()
export class DialogService {
  /**
   * Stream that emits when dialog has been opened.
   */
  public afterOpen: Subject<DialogRef<any>>;

  // Other variables
  private _onKeyDownEventHandler = this._onKeyDown.bind(this);
  private _openDialogs: Array<DialogRef<any>>;

  constructor(private _overlayService: OverlayService) {
    this.afterOpen = new Subject();
    this._openDialogs = new Array();
  }

  /**
   * Opens the confirmation dialog box
   * @param dialogData Dialog data to be populated on the confirm dialog
   * @param config Dialog configuration to be on the dialog
   */
  public openConfirmation<T>(
    dialogData: DialogConfirmation<T>,
    config: DialogConfig = new DialogConfig()
  ): DialogRef<DialogConfirmationComponent> {
    return this.open(DialogConfirmationComponent, {
      ...config,
      size: config.size || 'medium',
      data: dialogData
    });
  }

  /**
   * Opens the message dialog box
   * @param dialogData Dialog data to be populated on the confirm dialog
   * @param config Dialog configuration to be on the dialog
   */
  public openMessage(
    dialogData: DialogMessageConfig,
    config: DialogConfig = new DialogConfig()
  ): DialogRef<DialogMessageComponent> {
    return this.open(DialogMessageComponent, {
      ...config,
      size: config.size || 'medium',
      data: dialogData
    });
  }

  /**
   * Open/Create a modal dialog containing the given component
   * @param portal Type of dialog to be created
   * @param config Configuration of the dialog
   */
  public open<T>(
    portal: McsComponentType<T> | TemplateRef<T>,
    config: DialogConfig = new DialogConfig()
  ): DialogRef<T> {

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
  private _createOverlay(config: DialogConfig): OverlayRef {
    let overlayConfig = new OverlayConfig();
    overlayConfig.hasBackdrop = config.hasBackdrop;
    overlayConfig.backdropColor = config.backdropColor;
    overlayConfig.pointerEvents = 'auto';

    let overlayRef = this._overlayService.create(overlayConfig);
    overlayRef.moveElementToGlobal('center');
    return overlayRef;
  }

  /**
   * Attaches the dialog component/container to the overlay
   * @param overlay Overlay Element of the dialog
   * @param config Configuration of the dialog
   */
  private _attachDialogContainer(
    overlay: OverlayRef,
    config: DialogConfig
  ): DialogContainerComponent {

    let containerPortal = new PortalComponent(
      DialogContainerComponent, config.viewContainerRef
    );
    let containerRef: ComponentRef<DialogContainerComponent> =
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
    dialogContainer: DialogContainerComponent,
    overlayRef: OverlayRef,
    config: DialogConfig
  ): DialogRef<T> {

    // Create a reference to the dialog we're creating in order to give the user a handle
    // to modify and close it.
    let dialogRef = new DialogRef<T>(overlayRef, dialogContainer, config.id);

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
      dialogContainer.attachTemplate(new PortalTemplate(portal, null, { data: config.data }));
    } else {
      let injector = this._createInjector<T>(config, dialogRef, dialogContainer);
      let contentRef = dialogContainer.attachComponent(
        new PortalComponent(portal, undefined, undefined, injector)
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
    config: DialogConfig,
    dialogRef: DialogRef<T>,
    dialogContainer: DialogContainerComponent
  ): Injector {

    return Injector.create({
      providers: [
        { provide: DialogRef, useValue: dialogRef },
        { provide: DIALOG_CONTAINER, useValue: dialogContainer },
        { provide: DIALOG_DATA, useValue: config.data }
      ]
    });
  }

  /**
   * Event that emits when key is pressed
   * @param event Event type
   */
  private _onKeyDown(event: KeyboardEvent): void {
    if (isNullOrEmpty(this._openDialogs)) { return; }

    if (event.keyboardKey() === KeyboardKey.Escape) {
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
  private _removeOpenDialog(dialogRef: DialogRef<any>) {
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
