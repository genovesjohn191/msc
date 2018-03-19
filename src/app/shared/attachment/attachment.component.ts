import {
  Component,
  Input,
  Output,
  OnInit,
  ViewChild,
  TemplateRef,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import {
  FileUploader,
  FileItem
} from 'ng2-file-upload';
import {
  McsAttachment,
  McsTextContentProvider,
  McsDialogService,
  McsDialogRef,
  CoreDefinition
} from '../../core';
import {
  isNullOrEmpty,
  coerceNumber,
  replacePlaceholder
} from '../../utilities';

const DEFAULT_MAX_FILE_SIZE_IN_MB = 20;

@Component({
  selector: 'mcs-attachment',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block',
  }
})

export class AttachmentComponent implements OnInit {
  public textContent: any;
  public fileUploader: FileUploader;
  public hasDropZone: boolean;
  public errorDialogRef: McsDialogRef<any>;

  @Input()
  public attachedLimit: 'single' | 'multiple';

  @Input()
  public allowedMimeType: any[];

  @Output()
  public attachedFilesChanged: EventEmitter<McsAttachment[]>;

  @Input()
  public set maxSizeInMb(value: number) { this._maxSizeInMb = coerceNumber(value, 0); }
  private _maxSizeInMb: number = DEFAULT_MAX_FILE_SIZE_IN_MB;

  @ViewChild('errorDialogTemplate')
  private _errorDialogTemplate: TemplateRef<any>;

  public get errorIconKey(): string {
    return CoreDefinition.ASSETS_FONT_WARNING;
  }

  public constructor(
    private _textContentProvider: McsTextContentProvider,
    private _dialogService: McsDialogService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    // Set uploader configuration
    this.attachedFilesChanged = new EventEmitter<McsAttachment[]>();
  }

  public get attachedFiles(): FileItem[] {
    return this.fileUploader.queue;
  }

  public get cloudUploadBlueIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CLOUD_UPLOAD_BLUE;
  }

  public get closeIconKey(): string {
    return CoreDefinition.ASSETS_FONT_TRASH;
  }

  public ngOnInit() {
    // Initialize text content provider and file loader settings
    this.textContent = this._textContentProvider.content.shared.attachment;
    this.fileUploader = new FileUploader({
      autoUpload: false,
      queueLimit: this.attachedLimit === 'single' ? 1 : undefined,
      allowedMimeType: this.allowedMimeType,
      maxFileSize: 1024 * 1024 * this._maxSizeInMb
    });
    this.fileUploader.onWhenAddingFileFailed = this._onUploadingFileError.bind(this);
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
    let attachments: McsAttachment[] = new Array();

    this.attachedFiles.forEach((attachment) => {
      let fileReader = new FileReader();
      fileReader.readAsBinaryString(attachment._file);

      fileReader.onload = () => {
        let convertedAttachment = new McsAttachment();
        convertedAttachment.filename = attachment.file.name;
        convertedAttachment.fileContents = attachment.file;
        convertedAttachment.base64Contents = btoa(fileReader.result);
        attachments.push(convertedAttachment);
        this.attachedFilesChanged.emit(attachments);
      };
    });
    this._changeDetectorRef.markForCheck();
  }

  /**
   * This will be called when error occured while selecting a file
   * @param _file File object that is selected
   * @param _filter Filter settings of the file selected
   */
  private _onUploadingFileError(_file: any, _filter: any) {
    if (isNullOrEmpty(_file)) { return; }
    let errorMessage: string = '';

    // Set error message
    switch (_filter.name) {
      case 'queueLimit':
        return;

      case 'mimeType':
        errorMessage = this.textContent.errorFileType;
        break;

      case 'fileSize':
        errorMessage = replacePlaceholder(
          this.textContent.errorFileSize,
          'max_size',
          `${this._maxSizeInMb}`);
        break;

      default:
        errorMessage = this.textContent.errorGeneral;
        break;
    }

    // Open Error dialog
    this.errorDialogRef = this._dialogService.open(
      this._errorDialogTemplate,
      {
        disableClose: true,
        size: 'small',
        data: {
          message: errorMessage
        }
      }
    );
  }
}
