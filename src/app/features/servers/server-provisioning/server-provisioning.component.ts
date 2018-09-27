import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  throwError,
  Subject
} from 'rxjs';
import {
  switchMap,
  catchError,
  takeUntil
} from 'rxjs/operators';
import {
  McsTextContentProvider,
  McsErrorHandlerService,
  CoreDefinition,
  McsDataStatusFactory
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSubject
} from '@app/utilities';
import {
  McsJob,
  JobType,
  HttpStatusCode,
} from '@app/models';
import { JobsApiService } from '@app/services';

@Component({
  selector: 'mcs-server-provisioning',
  templateUrl: 'server-provisioning.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ServerProvisioningComponent implements OnInit, OnDestroy {
  public textContent: any;
  public job: McsJob;
  public dataStatusFactory: McsDataStatusFactory<McsJob>;

  private _destroySubject = new Subject<void>();

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _textContentProvider: McsTextContentProvider,
    private _jobApiService: JobsApiService,
    private _errorHandlerService: McsErrorHandlerService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.dataStatusFactory = new McsDataStatusFactory();
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers
      .createServer.serverProvisioningPage;
    this._getJobByParameterId();
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Returns status icon key
   */
  public get statusIconKey(): string {
    return CoreDefinition.ASSETS_GIF_LOADER_SPINNER;
  }

  /**
   * Get Job based on the given ID in the provided parameter
   */
  private _getJobByParameterId(): void {
    this.dataStatusFactory.setInProgress();
    this._activatedRoute.paramMap
      .pipe(
        takeUntil(this._destroySubject),
        catchError((error) => {
          // Handle common error status code
          this.dataStatusFactory.setError();
          this._errorHandlerService.handleHttpRedirectionError(error.status);
          return throwError(error);
        }),
        switchMap((params: ParamMap) => {
          let jobId = params.get('id');
          return this._jobApiService.getJob(jobId);
        }),
      )
      .subscribe((response) => {
        if (isNullOrEmpty(response)) { return; }
        this.job = response.content;
        this._validateJobType(this.job);
        this.dataStatusFactory.setSuccessful(response.content);
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Validate job type and return the error page in case
   * the job type is non-create server
   */
  private _validateJobType(job: McsJob): void {
    if (isNullOrEmpty(job)) { return; }
    let createServerType = job.type === JobType.CreateServer
      || job.type === JobType.CloneServer;
    if (!createServerType) {
      this._errorHandlerService.handleHttpRedirectionError(HttpStatusCode.NotFound);
    }
  }
}
