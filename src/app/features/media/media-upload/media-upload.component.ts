import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import {
  CoreDefinition,
  CoreRoutes,
  McsTextContentProvider
} from '@app/core';
import {
  unsubscribeSubject,
  getSafeProperty,
  McsSafeToNavigateAway
} from '@app/utilities';
import { RouteKey } from '@app/models';
import { MediaUploadDetailsComponent } from './details/media-upload-details.component';

@Component({
  selector: 'mcs-media-upload',
  templateUrl: 'media-upload.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MediaUploadComponent implements McsSafeToNavigateAway, OnInit, OnDestroy {
  public textContent: any;
  private _destroySubject = new Subject<void>();

  public get backIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_LEFT;
  }

  @ViewChild(MediaUploadDetailsComponent)
  private _detailsStep: MediaUploadDetailsComponent;

  constructor(
    private _router: Router,
    private _textContentProvider: McsTextContentProvider
  ) { }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.mediaUpload;
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Event that emits when navigating away from media upload page to other route
   */
  public safeToNavigateAway(): boolean {
    return getSafeProperty(this._detailsStep, (obj) => obj.safeToNavigateAway(), true);
  }

  /**
   * Navigates to media listing
   */
  public navigateToMedia(): void {
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.Media)]);
  }
}
