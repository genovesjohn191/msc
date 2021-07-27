import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { McsObjectCrispOrder } from '@app/models';

@Injectable()
export class CrispOrderService {
  private _crispOrderDetails = new BehaviorSubject<McsObjectCrispOrder>(null);
  private _crispOrderId: number;

  public getCrispOrderDetails(): Observable<McsObjectCrispOrder> {
    return this._crispOrderDetails.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  public setCrispOrderDetails(crispOrderDetails: McsObjectCrispOrder): void {
    this.setCrispOrderId(crispOrderDetails.orderId);
    this._crispOrderDetails.next(crispOrderDetails);
  }

  public setCrispOrderId(crispOrderId: number): void {
    this._crispOrderId = crispOrderId;
  }

  public getCrispOrderId(): number {
    return this._crispOrderId;
  }
}
