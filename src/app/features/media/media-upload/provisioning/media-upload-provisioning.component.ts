import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { McsTextContentProvider } from '@app/core';
import { unsubscribeSubject, isNullOrEmpty } from '@app/utilities';
import { McsJob } from '@app/models';
import { MediaUploadService } from '../media-upload.service';

@Component({
  selector: 'mcs-media-upload-provisioning',
  templateUrl: 'media-upload-provisioning.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MediaUploadProvisioningComponent implements OnInit, OnDestroy {
  public textContent: any;
  public jobs: McsJob[];

  private _destroySubject = new Subject<void>();

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _mediaUploadService: MediaUploadService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.mediaUpload.mediaStepGo;
    this._listenToJobsChanges();
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Listens to every jobs changes on the flyweight
   */
  private _listenToJobsChanges(): void {
    this._mediaUploadService.jobChanges
      .pipe(takeUntil(this._destroySubject))
      .subscribe((response) => {
        if (isNullOrEmpty(response)) { return; }
        this.jobs = [response];
        this._changeDetectorRef.markForCheck();
      });
  }
}
