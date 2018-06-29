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
  McsTextContentProvider,
  CoreDefinition
} from '../../../../core';

@Component({
  selector: 'mcs-session-idle-dialog',
  templateUrl: './session-idle.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'session-idle-dialog-wrapper'
  }
})

export class SessionIdleDialogComponent implements OnInit {
  public textContent: any;
  public countDown: Observable<number>;

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  constructor(
    private _textContentProvider: McsTextContentProvider,
    public dialogRef: McsDialogRef<SessionIdleDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData: any
  ) {
    this.textContent = this._textContentProvider.content
      .pageNotifications.sessionHandler.sessionIdleDialog;
  }

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
