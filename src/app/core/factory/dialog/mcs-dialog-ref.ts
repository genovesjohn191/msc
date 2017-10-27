import {
  Observable,
  Subject
} from 'rxjs/Rx';
import { McsOverlayRef } from '../overlay/mcs-overlay-ref';
import { McsDialogComponent } from './mcs-dialog.component';

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

  // Other variables
  private _afterClosed: Subject<any> = new Subject();
  private _result: any;

  constructor(
    private _overlayRef: McsOverlayRef,
    private _dialogContainer: McsDialogComponent,
    public readonly id: string = `mcs-dialog-${nextUniqueId++}`
  ) {

    // Listener for the dialog when it is finished
    this._dialogContainer.animationStateChanged
      .subscribe((event) => {
        if (event.phaseName === 'done' && event.toState === 'exit') {
          this._overlayRef.dispose();
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
   * Update the size of the dialog container based on the given length
   * @param width Width of the container
   * @param height Height of the container
   */
  public updateSize(width: string = 'auto', height: string = 'auto'): void {
    this._dialogContainer.updateSize(width, height);
  }
}
