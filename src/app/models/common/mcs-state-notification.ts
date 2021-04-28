import {
  CommonDefinition,
  McsStatusType
} from '@app/utilities';

export class McsStateNotification {
  constructor(
    public type: McsStatusType,
    public message: string,
    public tryAgainFunc?: () => void
  ) { }

  public get duration(): number {
    return this.type === 'error' ? CommonDefinition.STATE_NOTIFICATION_ERROR_DURATION :
      this.type === 'success' ? CommonDefinition.STATE_NOTIFICATION_SUCCESS_DURATION :
        CommonDefinition.STATE_NOTIFICATION_DEFAULT_DURATION;
  }

  public get icon(): string {
    return this.type === 'error' ? CommonDefinition.ASSETS_SVG_ERROR :
      this.type === 'success' ? CommonDefinition.ASSETS_SVG_SUCCESS :
        this.type === 'info' ? CommonDefinition.ASSETS_SVG_INFO :
          CommonDefinition.ASSETS_SVG_WARNING;
  }
}
