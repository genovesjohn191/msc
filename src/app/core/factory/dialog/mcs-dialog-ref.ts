import {
  Observable,
  Subject
} from 'rxjs/Rx';
import { CoreDefinition } from '../../core.definition';
import { McsOverlayRef } from '../overlay/mcs-overlay-ref';
import { McsDialogContainerComponent } from './mcs-dialog-container.component';

// Counter for unique dialog ids.
let nextUniqueId = 0;

/**
 * Dialog reference that can manipulate on the existing dialog
 */
export class McsDialogRef<T> {
  /**
   * Instance of the component attached in the dialog
   */
  public componentInstance: T;

  /**
   * Determine weather the dialog should disable the close
   * when esc key is pressed and clickoutside
   */
  public disableClose = this._dialogContainer.dialogConfig.disableClose;

  // Other variables
  private _afterClosed: Subject<any> = new Subject();
  private _result: any;

  constructor(
    private _overlayRef: McsOverlayRef,
    private _dialogContainer: McsDialogContainerComponent,
    public readonly id: string = `mcs-dialog-${nextUniqueId++}`
  ) {

    // Listener for the dialog when it is finished
    this._dialogContainer.animationStateChanged
      .subscribe((event) => {
        if (event.phaseName === 'done' && event.toState === 'exit') {
          this._overlayRef.dispose();
          this._dialogContainer.dispose();
          this._afterClosed.next(this._result);
          this._afterClosed.complete();
          this.componentInstance = null;
        }
      });
  }

  /**
   * Event the emits when the dialog is closed
   */
  public afterClosed(): Observable<any> {
    return this._afterClosed.asObservable();
  }

  /**
   * Close the current dialog
   * @param dialogResult Return the dialog result in the afterClosedStream
   */
  public close(dialogResult?: any): void {
    this._result = dialogResult;

    // Add animation chain here for closing
    this._dialogContainer.animationStateChanged
      .subscribe((event) => {
        if (event.phaseName === 'start') {
          this._overlayRef.detachBackdrop();
        }
      });
    this._dialogContainer.startExitAnimation();
  }

  /**
   * Update the size of the dialog container based on the given width and height
   * @param width Width of the container
   * @param height Height of the container
   */
  public updateSize(size?: any, width: string = 'auto', height: string = 'auto'): void {
    // Set the actual width of the dialog when the size is specified
    switch (size) {
      case 'small':
        width = CoreDefinition.DIALOG_SIZE_SMALL;
        break;
      case 'medium':
        width = CoreDefinition.DIALOG_SIZE_MEDIUM;
        break;
      case 'large':
        width = CoreDefinition.DIALOG_SIZE_LARGE;
        break;
      case 'xlarge':
        width = CoreDefinition.DIALOG_SIZE_XLARGE;
        break;
      default:
        break;
    }
    this._dialogContainer.updateSize(width, height);
  }
}
