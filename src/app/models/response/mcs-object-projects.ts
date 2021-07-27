import {
  CommonDefinition,
  JsonProperty} from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  Temperature,
  temperatureText
} from '../enumerations/temperature.enum';

export class McsObjectProjects extends McsEntityBase {
  @JsonProperty()
  public number: string = undefined;

  @JsonProperty()
  public temperature: string = undefined;

  @JsonProperty()
  public companyName: string = undefined;

  @JsonProperty()
  public shortDescription: string = undefined;

  @JsonProperty()
  public primaryCrispOrderId: string = undefined;

  @JsonProperty()
  public status: string = undefined;

  @JsonProperty()
  public projectManager: string = undefined;

  /**
   * Return the temperature icon key based on the temperature value
   */
  public get temperatureIconKey(): string {
    let temperatureIconKey: string = '';

    switch (this.temperature) {
      case temperatureText[Temperature.Red]: // Red
      temperatureIconKey = CommonDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case temperatureText[Temperature.Amber]: // Amber
      temperatureIconKey = CommonDefinition.ASSETS_SVG_STATE_RESTARTING;
        break;

      case temperatureText[Temperature.Green]: // Green
      default:
        temperatureIconKey = CommonDefinition.ASSETS_SVG_STATE_RUNNING;
        break;
    }
    return temperatureIconKey;
  }
}
