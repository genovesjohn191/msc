import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  McsTextContentProvider,
  McsApiJob
} from '../../../../core';
import { unsubscribeSubject } from '../../../../utilities';
import { ServerCreateFlyweightContext } from '../server-create-flyweight.context';

@Component({
  selector: 'mcs-server-create-provisioning',
  templateUrl: 'server-create-provisioning.component.html'
})

export class ServerCreateProvisioningComponent implements OnInit, OnDestroy {
  public textContent: any;
  public jobs: McsApiJob[];

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
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Listens to every jobs changes on the factory
   */
  private _listenToJobsChanges(): void {
    this._serverCreateFlyweightContext.jobsChanges
      .pipe(takeUntil(this._destroySubject))
      .subscribe((response) => {
        this.jobs = response;
        this._changeDetectorRef.markForCheck();
      });
  }
}
