import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  CoreDefinition,
  McsUniqueId
} from '@app/core';
import { McsResourceMedia } from '@app/models';
import {
  MediaCommand,
  mediaCommandText
} from './media-command.enum';

@Component({
  selector: 'mcs-media-command',
  templateUrl: './media-command.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'id'
  }
})

export class MediaCommandComponent {
  @Input()
  public media: McsResourceMedia;

  @Input()
  public id: string;

  @Output()
  public onClick: EventEmitter<MediaCommand> = new EventEmitter();

  @ViewChild('popoverActionElement')
  public popoverActionElement: any;

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

  constructor() {
    this.id = McsUniqueId.NewId('media-command');
  }

  public onExecuteCommand(command: MediaCommand) {
    if (this.popoverActionElement) {
      this.popoverActionElement.close();
    }
    this.onClick.emit(command);
  }
}
