import {
  Observable,
  Subject
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import { McsUniqueId } from '@app/core';
import { OverlayRef } from '../../overlay';
import { SnackBarContainerComponent } from '../snack-bar-container/snack-bar-container.component';

/**
 * Snackbar reference that can manipulate on the existing snackbar
 */
export class SnackBarRef<T> {
  /**
   * Instance of the component/template attached in the snackbar
   */
  public portalInstance: T;

  // Other variables
  private _afterClosed: Subject<any> = new Subject();
  private _afterOpened: Subject<any> = new Subject();
  private _durationTimeoutId: number;

  constructor(
    private _overlayRef: OverlayRef,
    public readonly containerInstance: SnackBarContainerComponent,
    public readonly id: string = McsUniqueId.NewId('snack-bar')
  ) {
    this._listenToAnimationChanged();
  }

  /**
   * Event that emits when the snackbar has totally closed
   */
  public afterClosed(): Observable<any> {
    return this._afterClosed.asObservable();
  }

  /**
   * Event that emits when the snackbar has totally opened
   */
  public afterOpened(): Observable<any> {
    return this._afterOpened.asObservable();
  }

  /**
   * Close the current snackbar
   */
  public close(): void {
    this.containerInstance.startExitAnimation();
    if (!isNullOrEmpty(this._durationTimeoutId)) {
      clearTimeout(this._durationTimeoutId);
    }
  }

  /**
   * Closes the current snackbar based on the duration given
   * @param duration Duration to close the snackbar
   */
  public closeAfter(duration: number): void {
    if (isNullOrEmpty(duration)) { return; }
    this._durationTimeoutId = window.setTimeout(this.close.bind(this), duration);
  }

  /**
   * Listent to each animation changed of the snackbar container
   */
  private _listenToAnimationChanged(): void {
    this.containerInstance.animationStateChanged
      .pipe(takeUntil(this._afterClosed))
      .subscribe((event) => {
        // Set the data when snackbar is closing after finishing the animation
        let snackBarClosing = event.phaseName === 'done' && event.toState === 'void';
        if (snackBarClosing) { this._closingSnackBar(); }

        // Set the data when snackbar is closing after finishing the animation
        let snackBarOpening = event.phaseName === 'done' && event.toState !== 'void';
        if (snackBarOpening) { this._openingSnackBar(); }
      });
  }

  /**
   * Event that emits before the snackbar will totally opened
   */
  private _openingSnackBar(): void {
    this._afterOpened.next(true);
    this._afterOpened.complete();
  }

  /**
   * Event that emits before the snackbar will totally closed
   */
  private _closingSnackBar(): void {
    this._overlayRef.dispose();
    this.containerInstance.dispose();
    this._afterClosed.next(true);
    this._afterClosed.complete();
  }
}
