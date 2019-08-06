import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/event-manager';
import {
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import {
  DialogService,
  DialogMessageConfig
} from '@app/shared';
import {
  McsJob,
  JobType,
  DataStatus,
  McsServerCredential
} from '@app/models';

@Component({
  selector: 'mcs-default-page',
  templateUrl: './default-page.component.html',
  styleUrls: ['./default-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DefaultPageComponent {

  constructor(
    private _translateService: TranslateService,
    private _eventDispatcher: EventBusDispatcherService,
    private _dialogService: DialogService
  ) {
    this._registerEvents();
  }

  /**
   * Listens to current user job to trigger the dialog box
   * when the reset vm password has finished
   */
  private _registerEvents(): void {
    this._eventDispatcher.addEventListener(
      McsEvent.jobServerResetPassword, this._onResetVmPassword.bind(this));
  }

  /**
   * Event that emits when vm password has been received
   */
  private _onResetVmPassword(job: McsJob): void {
    let jobIsResetVmPassword = getSafeProperty(job, (obj) => obj.type) === JobType.ResetServerPassword;
    if (!jobIsResetVmPassword) { return; }
    if (job.dataStatus !== DataStatus.Success) { return; }

    let credentials: McsServerCredential = getSafeProperty(job, (obj) => obj.tasks[0].referenceObject.credential);
    if (isNullOrEmpty(credentials)) {
      throw new Error(`Unable to display the dialog of undefined credentials after resetting the password of VM.`);
    }

    let dialogData = {
      title: this._translateService.instant('dialogResetPasswordFinished.title'),
      message: this._translateService.instant('dialogResetPasswordFinished.message', {
        server_name: credentials.server,
        username: credentials.username,
        password: credentials.password
      }),
      type: 'info'
    } as DialogMessageConfig;

    this._dialogService.openMessage(dialogData, {
      id: 'reset-vm-password-confirmation',
      disableClose: true
    });
  }
}
