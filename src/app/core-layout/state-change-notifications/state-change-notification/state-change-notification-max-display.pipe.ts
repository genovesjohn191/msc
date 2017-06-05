import {
  Pipe,
  PipeTransform
} from '@angular/core';
import {
  McsApiJob,
  CoreDefinition
} from '../../../core';

@Pipe({
  name: 'mcsStateChangeNotificationMaxDisplayPipe',
  pure: false
})

export class StateChangeNotificationMaxDisplayPipe implements PipeTransform {
  public transform(notifications: McsApiJob[]): any {
    return notifications.slice(0, CoreDefinition.NOTIFICATION_STATE_CHANGE_MAX_DISPLAY);
  }
}
