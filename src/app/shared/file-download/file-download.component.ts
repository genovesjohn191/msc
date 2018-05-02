import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import {
  CoreDefinition,
  McsFileInfo
} from '../../core';
import { isNullOrEmpty } from '../../utilities';

@Component({
  selector: 'mcs-file-download',
  templateUrl: 'file-download.component.html',
  styleUrls: ['./file-download.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class FileDownloadComponent {
  @Input()
  public file: McsFileInfo;

  // TODO: Needs to be finalized once API is ready
  @Input()
  public url: string;

  public get downloadIconKey(): string {
    return CoreDefinition.ASSETS_SVG_DOWNLOAD;
  }

  /**
   * Get file type
   */
  public get fileType(): string {
    if (isNullOrEmpty(this.file.fileContents)) { return ''; }
    return this.file.fileContents.type.toUpperCase();
  }

  /**
   * Get file size
   */
  public get fileSize(): number {
    if (isNullOrEmpty(this.file.fileContents)) { return 0; }
    return this.file.fileContents.size;
  }

  /**
   * Download the file
   */
  public downloadFile(): void {
    if (isNullOrEmpty(this.url)) { return; }
    window.open(this.url);
  }

}
