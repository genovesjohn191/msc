import {
  Component,
  OnInit,
  OnChanges,
  OnDestroy,
  Input,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  SimpleChanges
} from '@angular/core';
import {
  isNullOrEmpty,
  animateFactory,
  unsubscribeSubject
} from '../../../../utilities';
import { McsTextContentProvider } from '../../../../core';
import { ServerMedia } from '../../models';

@Component({
  selector: 'mcs-server-manage-media',
  templateUrl: 'server-manage-media.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeIn
  ],
  host: {
    'class': 'server-manage-media-wrapper block block-items-medium'
  }
})

export class ServerManageMediaComponent implements OnInit, OnChanges, OnDestroy {
  public textContent: any;

  @Output()
  public selectedMediaChange = new EventEmitter<ServerMedia>();

  @Input()
  public medias: ServerMedia[];

  @Input()
  public get selectedMedia(): ServerMedia { return this._selectedMedia; }
  public set selectedMedia(value: ServerMedia) {
    if (this._selectedMedia !== value) {
      this._selectedMedia = value;
      this.selectedMediaChange.emit(this._selectedMedia);
    }
  }
  private _selectedMedia: ServerMedia;

  constructor(private _textContentProvider: McsTextContentProvider) { }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers.shared.manageMedia;
  }

  public ngOnChanges(changes: SimpleChanges) {
    let mediasChange = changes['medias'];
    if (!isNullOrEmpty(mediasChange)) {
      this._setSelectedMedia();
    }
  }

  public ngOnDestroy() {
    unsubscribeSubject(this.selectedMediaChange);
  }

  /**
   * Sets the selected media if no media selected yet
   */
  private _setSelectedMedia(): void {
    if (isNullOrEmpty(this.medias)) { return; }
    let hasSelectedMedia = !isNullOrEmpty(this.selectedMedia)
      && !isNullOrEmpty(this.medias.find((network) => network === this.selectedMedia));
    if (hasSelectedMedia) { return; }
    this.selectedMedia = this.medias[0];
  }
}
