import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  CoreDefinition,
  McsTextContentProvider
} from '../../../../core';
import {
  Media,
  MediaCommand,
  mediaCommandText
} from '../../models';

// Unique Id that generates during runtime
let nextUniqueId = 0;

@Component({
  selector: 'mcs-media-command',
  templateUrl: './media-command.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'id'
  }
})
export class MediaCommandComponent implements OnInit {
  @Input()
  public media: Media;

  @Input()
  public id: string;

  @Output()
  public onClick: EventEmitter<MediaCommand> = new EventEmitter();

  @ViewChild('popoverActionElement')
  public popoverActionElement: any;

  public textContent: any;

  public get gearIconKey(): string {
    return CoreDefinition.ASSETS_SVG_COG;
  }

  public get mediaCommandAttachText(): string {
    return mediaCommandText[MediaCommand.Attach];
  }

  public get mediaCommandDeleteText(): string {
    return mediaCommandText[MediaCommand.Delete];
  }

  public get mediaCommandRenameText(): string {
    return mediaCommandText[MediaCommand.Rename];
  }

  constructor(private _textProvider: McsTextContentProvider) {
    this.id = `mcs-media-command-${nextUniqueId++}`;
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.servers;
  }

  public onExecuteCommand(command: MediaCommand) {
    if (this.popoverActionElement) {
      this.popoverActionElement.close();
    }
    this.onClick.emit(command);
  }
}
