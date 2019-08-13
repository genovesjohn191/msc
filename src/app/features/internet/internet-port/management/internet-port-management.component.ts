import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { unsubscribeSubject } from '@app/utilities';
import { InternetPortService } from '../internet-port.service';
import { InternetPortDetailsBase } from '../internet-details.base';

@Component({
  selector: 'mcs-internet-port-management',
  templateUrl: './internet-port-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class InternetPortManagementComponent extends InternetPortDetailsBase implements OnInit, OnDestroy {

  private _destroySubject = new Subject<void>();

  constructor(
    _internetPortService: InternetPortService,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {
    super(_internetPortService);
  }

  public ngOnInit(): void {
    this.initializeBase();
  }

  public ngOnDestroy(): void {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Event that will automatically invoked when the internet port selection has been changed
   */
  protected internetPortSelectionChange(): void {
    this._changeDetectorRef.markForCheck();
  }

}
