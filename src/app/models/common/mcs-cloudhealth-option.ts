import { McsCloudHealthAlertConfigurationItems } from '../response/mcs-cloudhealth-alert-configuration-items';
import { McsOption } from './mcs-option';

export class McsCloudHealthOption {
  public text?: string;
  public subText?: string;
  public config?: McsCloudHealthAlertConfigurationItems;
  public alertType?: string;

  constructor(
    _text: string,
    _subText: string,
    _config: McsCloudHealthAlertConfigurationItems,
    _alertType: string
  ) {
    this.text = _text;
    this.subText = _subText;
    this.config = _config;
    this.alertType = _alertType;
  }
}
