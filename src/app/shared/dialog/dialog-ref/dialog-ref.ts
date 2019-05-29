import {
  Observable,
  Subject
} from 'rxjs';
import { McsUniqueId } from '@app/core';
import { OverlayRef } from '../../overlay';
import { DialogContainerComponent } from '../dialog-container/dialog-container.component';

const DIALOG_SIZE_SMALL = '300px';
const DIALOG_SIZE_MEDIUM = '400px';
const DIALOG_SIZE_LARGE = '500px';
const DIALOG_SIZE_XLARGE = '600px';

/**
 * Dialog reference that can manipulate on the existing dialog
 */
export class DialogRef<T> {
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
    private _overlayRef: OverlayRef,
    private _dialogContainer: DialogContainerComponent,
    public readonly id: string = McsUniqueId.NewId('dialog')
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
        width = DIALOG_SIZE_SMALL;
        break;
      case 'medium':
        width = DIALOG_SIZE_MEDIUM;
        break;
      case 'large':
        width = DIALOG_SIZE_LARGE;
        break;
      case 'xlarge':
        width = DIALOG_SIZE_XLARGE;
        break;
      default:
        break;
    }
    this._dialogContainer.updateSize(width, height);
  }
}
