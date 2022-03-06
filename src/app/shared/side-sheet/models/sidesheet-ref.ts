import {
  takeUntil,
  tap,
  Observable,
  Subject
} from 'rxjs';

import { OverlayRef } from '@angular/cdk/overlay';
import { McsUniqueId } from '@app/core';

import { SideSheetComponent } from '../sidesheet.component';
import { SideSheetResult } from './sidesheet.result';

export class SideSheetRef<TComponent> {
  public componentInstance: TComponent;

  private _result: any;
  private _afterClosed = new Subject<any>();
  private _destroySubject = new Subject<void>();

  constructor(
    public readonly id = McsUniqueId.NewId('mcs-sidesheet'),
    private _overlayRef: OverlayRef,
    private _container: SideSheetComponent
  ) {
    this._subscribeToClosing();
  }

  public afterClosed<TData>(): Observable<SideSheetResult<TData>> {
    return this._afterClosed.asObservable();
  }

  public close<TData>(result?: SideSheetResult<TData>): boolean {
    this._result = result;
    return this._container.close();
  }

  private _subscribeToClosing(): void {
    this._container.closed.pipe(
      takeUntil(this._destroySubject),
      tap(() => {
        this._overlayRef.dispose();
        this._container.dispose();
        this._afterClosed.next(this._result);
        this._afterClosed.complete();
        this.componentInstance = null;
      })
    ).subscribe();
  }
}

