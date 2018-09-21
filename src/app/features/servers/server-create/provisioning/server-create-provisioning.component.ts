import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  McsTextContentProvider
} from '@app/core';
import { unsubscribeSubject } from '@app/utilities';
import { McsJob } from '@app/models';
import { ServerCreateFlyweightContext } from '../server-create-flyweight.context';

@Component({
  selector: 'mcs-server-create-provisioning',
  templateUrl: 'server-create-provisioning.component.html'
})

export class ServerCreateProvisioningComponent implements OnInit, OnDestroy {
  public textContent: any;
  public jobs: McsJob[];
  public errorResponse: any;

  private _destroySubject = new Subject<void>();

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef,
    private _serverCreateFlyweightContext: ServerCreateFlyweightContext
  ) { }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers
      .createServer.serverProvisioningStep;
    this._listenToJobsChanges();
    this._listenToErrorChanges();
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Listens to every jobs changes on the flyweight
   */
  private _listenToJobsChanges(): void {
    this._serverCreateFlyweightContext.jobsChanges
      .pipe(takeUntil(this._destroySubject))
      .subscribe((response) => {
        this.jobs = response;
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Listens to each error changes on the flyweight
   */
  private _listenToErrorChanges(): void {
    this._serverCreateFlyweightContext.errorChanges
      .pipe(takeUntil(this._destroySubject))
      .subscribe((response) => {
        this.errorResponse = response;
        this._changeDetectorRef.markForCheck();
      });
  }
}
