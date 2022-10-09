import { McsCloudHealthAlertConfigurationItems } from '../response/mcs-cloudhealth-alert-configuration-items';

export class McsCloudHealthOption {
  public text?: string;
  public subText?: string;
  public config?: McsCloudHealthAlertConfigurationItems;
  public alertType?: string;
  public actionLabel: string;

  constructor(
    _text: string,
    _subText: string,
    _config: McsCloudHealthAlertConfigurationItems,
    _alertType: string,
    _actionLabel: string,
  ) {
    this.text = _text;
    this.subText = _subText;
    this.config = _config;
    this.alertType = _alertType;
    this.actionLabel = _actionLabel;
  }
}
