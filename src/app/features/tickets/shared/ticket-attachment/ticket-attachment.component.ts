import {
  Component,
  Input,
  Output,
  OnInit,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  FileUploader,
  FileItem
} from 'ng2-file-upload';
import { isNullOrEmpty } from '../../../../utilities';
import {
  CoreDefinition,
  McsTextContentProvider
} from '../../../../core';
import { TicketFileInfo } from '../../models';

@Component({
  selector: 'mcs-ticket-attachment',
  templateUrl: './ticket-attachment.component.html',
  styles: [require('./ticket-attachment.component.scss')],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TicketAttachmentComponent implements OnInit {

  public textContent: any;
  public fileUploader: FileUploader;
  public hasDropZone: boolean;

  @Input()
  public attachedType: 'single' | 'multiple';

  @Output()
  public attachedFilesChanged: EventEmitter<TicketFileInfo[]>;

  public constructor(private _textContentProvider: McsTextContentProvider  ) {
    // Set uploader configuration
    this.attachedFilesChanged = new EventEmitter<TicketFileInfo[]>();
  }

  public get attachedFiles(): FileItem[] {
    return this.fileUploader.queue;
  }

  public get attachmentIconKey(): string {
    return CoreDefinition.ASSETS_FONT_ATTACHMENT;
  }

  public get closeIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CLOSE;
  }

  public ngOnInit() {
    // Initialize text content provider and file loader settings
    this.textContent = this._textContentProvider.content.tickets.shared.ticketAttachment;
    this.fileUploader = new FileUploader({
      autoUpload: false,
      queueLimit: this.attachedType === 'single' ? 1 : undefined,
      allowedMimeType: ['image/jpeg','image/png', 'image/bmp', 'text/plain']
    });
  }

  /**
   * Get the file flag when the drag and drop zone of the file is hover
   * @param hasDrop Drop flag
   */
  public onFileOver(hasDrop: any) {
    this.hasDropZone = hasDrop;
    if (hasDrop) {
      this._notifyOutputParameter();
    }
  }

  /**
   * Notify output parameter when the selection of file is changes
   */
  public onSelectFile() {
    this._notifyOutputParameter();
  }

  /**
   * Remove the file from the queue of attachments
   * @param file File to be remove
   */
  public removeAttachment(file: FileItem) {
    if (isNullOrEmpty(file)) { return; }
    this.fileUploader.removeFromQueue(file);
    this._notifyOutputParameter();
  }

  /**
   * Notify the output parameter based on the file selection
   */
  private _notifyOutputParameter(): void {
    if (isNullOrEmpty(this.attachedFiles)) { return; }
    let attachments: TicketFileInfo[] = new Array();

    this.attachedFiles.forEach((attachment) => {
      let fileReader = new FileReader();
      fileReader.readAsBinaryString(attachment._file);

      fileReader.onload = () => {
        let convertedAttachment = new TicketFileInfo();
        convertedAttachment.fileName = attachment.file.name;
        convertedAttachment.base64Contents = btoa(fileReader.result);
        attachments.push(convertedAttachment);
        this.attachedFilesChanged.emit(attachments);
      };
    });
  }
}
