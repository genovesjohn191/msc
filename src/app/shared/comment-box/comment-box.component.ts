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
  FormGroup,
  FormControl
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  FileUploader,
  FileItem
} from 'ng2-file-upload';
import { CoreDefinition } from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsFileInfo,
  McsComment
} from '@app/models';
import {
  DialogService,
  DialogRef
} from '../dialog';

@Component({
  selector: 'mcs-comment-box',
  templateUrl: './comment-box.component.html',
  styleUrls: ['./comment-box.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'comment-box-wrapper',
  }
})

export class CommentBoxComponent implements OnInit {
  public fileUploader: FileUploader;
  public hasDropZone: boolean;
  public errorDialogRef: DialogRef<any>;
  public fgComment: FormGroup;
  public fcComment: FormControl;

  @Input()
  public attachedLimit: 'single' | 'multiple';

  @Input()
  public allowedMimeType: any[];

  @Output()
  public attachedFilesChanged: EventEmitter<McsFileInfo[]>;

  @Output()
  public onAddComment: EventEmitter<McsComment>;

  @ViewChild('errorDialogTemplate')
  public errorDialogTemplate: TemplateRef<any>;

  public get errorIconKey(): string {
    return CoreDefinition.ASSETS_FONT_WARNING;
  }

  public constructor(
    private _translateService: TranslateService,
    private _dialogService: DialogService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    // Set uploader configuration
    this.onAddComment = new EventEmitter<McsComment>();
    this.attachedFilesChanged = new EventEmitter<McsFileInfo[]>();
  }

  public get attachedFiles(): FileItem[] {
    return this.fileUploader.queue;
  }

  public get hasAttachment(): boolean {
    return !!(this.attachedFiles.length > 0);
  }

  public get allowMultiple(): boolean {
    return this.attachedLimit === 'multiple';
  }

  public get showAttachButton(): boolean {
    return this.allowMultiple ? true : !this.hasAttachment;
  }

  public get attachmentIconKey(): string {
    return CoreDefinition.ASSETS_FONT_ATTACHMENT;
  }

  public get closeIconKey(): string {
    return CoreDefinition.ASSETS_FONT_TRASH;
  }

  public ngOnInit() {
    // Initialize text content provider and file loader settings
    this.fileUploader = new FileUploader({
      autoUpload: false,
      queueLimit: this.allowMultiple ? undefined : 1,
      allowedMimeType: this.allowedMimeType
    });
    this.fileUploader.onWhenAddingFileFailed = this._onUploadingFileError.bind(this);
    this._registerFormControl();
  }

  /**
   * Get the file flag when the drag and drop zone of the file is hover
   * @param hasDrop Drop flag
   */
  public onFileOver(hasDrop: any) {
    this.hasDropZone = hasDrop;
  }

  /**
   * Notify output parameter when the selection of file is changes
   */
  public onSelectFile() {
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Remove the file from the queue of attachments
   * @param file File to be remove
   */
  public removeAttachment(file: FileItem) {
    if (isNullOrEmpty(file)) { return; }
    this.fileUploader.removeFromQueue(file);
  }

  /**
   * Add comment and emit the changes on the output parameter
   */
  public async addComment(): Promise<void> {
    let comment: McsComment = new McsComment();
    let hasComment: boolean = !isNullOrEmpty(this.fcComment.value);

    // Check comment message first if it has content.
    if (!hasComment) {
      this.fcComment.setErrors({ required: true });
      this.fcComment.markAsTouched();
      return;
    }
    // Emit changes when all are valid
    comment.message = this.fcComment.value;
    comment.attachments = await this._getAttachmentsAsync();
    this.onAddComment.next(comment);
    this._clearContents();
  }

  /**
   * Clear all records from comment box
   */
  private _clearContents(): void {
    this.fcComment.reset();
    this.fileUploader.clearQueue();
  }

  /**
   * Get attachment using asynchronous process to make sure the loading process is ended
   */
  private _getAttachmentsAsync(): Promise<McsFileInfo[]> {
    if (isNullOrEmpty(this.attachedFiles)) { return undefined; }

    return new Promise<McsFileInfo[]>((resolve) => {

      let attachments: McsFileInfo[] = new Array();
      this.attachedFiles.forEach((attachment) => {
        let fileReader = new FileReader();
        fileReader.readAsBinaryString(attachment._file);

        fileReader.onload = () => {
          let convertedAttachment = new McsFileInfo();
          convertedAttachment.filename = attachment.file.name;
          convertedAttachment.fileContents = attachment.file;
          convertedAttachment.base64Contents = btoa(fileReader.result as any);
          attachments.push(convertedAttachment);

          // Make sure all the data are loaded
          if (attachments.length === this.attachedFiles.length) {
            resolve(attachments);
          }
        };
      });
    });
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
        errorMessage = this._translateService.instant('shared.commentBox.errorFileType');
        break;

      default:
        errorMessage = this._translateService.instant('shared.commentBox.errorGeneral');
        break;
    }

    // Open Error dialog
    this.errorDialogRef = this._dialogService.open(
      this.errorDialogTemplate,
      {
        disableClose: true,
        size: 'small',
        data: {
          message: errorMessage
        }
      }
    );
  }

  /**
   * Form groups and Form controls registration area
   */
  private _registerFormControl(): void {
    // Register Form Controls
    this.fcComment = new FormControl('', [
    ]);

    // Register Form Groups using binding
    this.fgComment = new FormGroup({
      fcComment: this.fcComment
    });
  }
}
