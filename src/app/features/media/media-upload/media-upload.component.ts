import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewChild
} from '@angular/core';
import { Subject } from 'rxjs';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsWizardBase
} from '@app/core';
import {
  unsubscribeSubject,
  getSafeProperty,
  McsSafeToNavigateAway
} from '@app/utilities';
import { MediaUploadDetailsComponent } from './details/media-upload-details.component';
import { MediaUploadService } from './media-upload.service';

@Component({
  selector: 'mcs-media-upload',
  templateUrl: 'media-upload.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MediaUploadComponent extends McsWizardBase
  implements McsSafeToNavigateAway, OnInit, OnDestroy {

  public textContent: any;

  private _destroySubject = new Subject<void>();

  @ViewChild(MediaUploadDetailsComponent)
  private _detailsStep: MediaUploadDetailsComponent;

  constructor(
    _mediaUploadService: MediaUploadService,
    private _textContentProvider: McsTextContentProvider,
  ) {
    super(_mediaUploadService);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.mediaUpload;
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  public get backIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  /**
   * Event that emits when navigating away from media upload page to other route
   */
  public safeToNavigateAway(): boolean {
    return getSafeProperty(this._detailsStep, (obj) => obj.safeToNavigateAway(), true);
  }
}
