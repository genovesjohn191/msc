import {
  Component,
  OnInit,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import {
  Observable,
  timer
} from 'rxjs';
import {
  map,
  take
} from 'rxjs/operators';
import {
  MCS_DIALOG_DATA,
  McsDialogRef,
  CoreDefinition
} from '@app/core';

@Component({
  selector: 'mcs-session-idle-dialog',
  templateUrl: './session-idle.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'session-idle-dialog-wrapper'
  }
})

export class SessionIdleDialogComponent implements OnInit {
  public countDown: Observable<number>;

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  constructor(
    public dialogRef: McsDialogRef<SessionIdleDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData: any
  ) {}

  public ngOnInit(): void {
    this.countDown = timer(0, 1000).pipe(
      take(this.dialogData),
      map(() => this.dialogData--)
    );
  }

  /**
   * Continue session and close the displayed dialog
   */
  public continueSession(): void {
    this.dialogRef.close(true);
  }
}
