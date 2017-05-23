import {
  Pipe,
  PipeTransform
} from '@angular/core';
import {
  McsApiJob,
  CoreDefinition
} from '../../core';

@Pipe({
  name: 'mcsNotificationMaxDisplay',
  pure: false
})

export class NotificationMaxDisplayPipe implements PipeTransform {
  public transform(notifications: McsApiJob[]): any {
    return notifications.slice(0, CoreDefinition.NOTIFICATION_MAX_DISPLAY);
  }
}
