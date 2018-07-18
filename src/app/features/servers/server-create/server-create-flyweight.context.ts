import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { McsApiJob } from '../../../core';
import { isNullOrEmpty } from '../../../utilities';
import { Resource } from '../../resources';
import {
  Order,
  OrdersService
} from '../../orders';

@Injectable()
export class ServerCreateFlyweightContext {
  public jobsChanges = new BehaviorSubject<McsApiJob[]>(undefined);
  public resourceChanges = new BehaviorSubject<Resource>(undefined);
  public formArrayChanges = new BehaviorSubject<FormArray>(undefined);

  private _jobs: McsApiJob[];
  private _resource: Resource;
  private _formArray: FormArray;

  /**
   * Returns the current order details
   */
  public get order(): Order { return this._order; }
  private _order: Order;

  constructor(_ordersService: OrdersService) {
    this._jobs = new Array();
  }

  /**
   * Sets the creation form array
   * `@Note`: It can be multiple form group when using multiple creation of server
   * @param formArray Form array to be set
   */
  public setCreationFormArray(formArray: FormArray): void {
    if (this._formArray === formArray) { return; }
    this._formArray = formArray;
    this.formArrayChanges.next(this._formArray);
  }

  /**
   * Sets the resource instance to the subject
   * @param resource Resource to be set and will notify the changes made
   */
  public setResource(resource: Resource): void {
    if (this._resource === resource) { return; }
    this._resource = resource;
    this.resourceChanges.next(this._resource);
  }

  /**
   * Sets / Add the job provided to the instance of the jobs
   * @param job Job to be added
   */
  public setJob(job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }
    this._jobs.push(job);
    this.jobsChanges.next(this._jobs);
  }

  public setAddOns(_addOns: any): void {
    // Do something
  }

  public setOrderDetails(_orderDetails: Order): void {
    if (isNullOrEmpty(_orderDetails)) { return undefined; }
    this._order = _orderDetails;
  }

  public submitServer(): void {
    // Do something
  }
}
