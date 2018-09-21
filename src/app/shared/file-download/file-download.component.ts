import {
  Component,
  Input,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Output
} from '@angular/core';
import { CoreDefinition } from '@app/core';
import { coerceNumber, coerceBoolean } from '@app/utilities';

@Component({
  selector: 'mcs-file-download',
  templateUrl: 'file-download.component.html',
  styleUrls: ['./file-download.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'file-download-wrapper'
  }
})

export class FileDownloadComponent {
  @Output()
  public download = new EventEmitter<FileDownloadComponent>();

  @Input()
  public fileType: string;

  @Input()
  public get sizeMB(): number { return this._sizeMB; }
  public set sizeMB(value: number) {
    if (value !== this._sizeMB) {
      this._sizeMB = coerceNumber(value);
    }
  }
  private _sizeMB: number;

  @Input()
  public get downloading(): boolean { return this._downloading; }
  public set downloading(value: boolean) {
    if (value !== this._downloading) {
      this._downloading = coerceBoolean(value);
    }
  }
  private _downloading: boolean;

  /**
   * Returns the download icon key
   */
  public get downloadIconKey(): string {
    return CoreDefinition.ASSETS_SVG_DOWNLOAD;
  }

  /**
   * Download the file
   */
  public downloadFile(): void {
    this.download.emit(this);
  }
}
