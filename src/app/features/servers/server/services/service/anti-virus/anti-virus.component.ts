import {
  OnChanges,
  Input,
  Component,
  SimpleChanges
} from '@angular/core';
import {
  ServerServicesView,
  AntiVirusStatus,
  antiVirusStatusLabel,
  McsServerHostSecurityAntiVirus
} from '@app/models';
import {
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';
import { ServiceDetailViewBase } from '../service-detail-view.base';

type ServerAntiVirusStatusDetails = {
  icon: string;
  label: string;
  logsLinkFlag: boolean;
};

@Component({
  selector: 'mcs-service-anti-virus',
  templateUrl: './anti-virus.component.html',
  host: {
    'class': 'block'
  }
})
export class ServiceAntiVirusComponent extends ServiceDetailViewBase implements OnChanges {

  @Input()
  public set antivirus(antivirus: McsServerHostSecurityAntiVirus) {
    this._antivirus = antivirus;
  }
  public get antivirus(): McsServerHostSecurityAntiVirus {
    return this._antivirus;
  }

  private _antivirusStatusDetailsMap: Map<AntiVirusStatus, ServerAntiVirusStatusDetails>;
  private _antiVirusStatusDetails: ServerAntiVirusStatusDetails;
  private _antivirus: McsServerHostSecurityAntiVirus;

  constructor() {
    super(ServerServicesView.AntiVirus);
    this._createStatusMap();
    this._antiVirusStatusDetails = this._antivirusStatusDetailsMap.get(AntiVirusStatus.Warning);
  }

  public ngOnChanges(changes: SimpleChanges) {
    let antivirus = changes['antivirus'];
    if (!isNullOrEmpty(antivirus)) {
      this._antiVirusStatusDetails = this._antivirusStatusDetailsMap.get(this._antivirus.status);
    }
  }

  public get statusIcon(): string {
    return this._antiVirusStatusDetails.icon;
  }

  public get statusLabel(): string {
    return this._antiVirusStatusDetails.label;
  }

  public get statusLogsLinkFlag(): boolean {
    return this._antiVirusStatusDetails.logsLinkFlag;
  }

  /**
   * Initializes the server antivirus status map
   */
  private _createStatusMap(): void {
    this._antivirusStatusDetailsMap = new Map();

    this._antivirusStatusDetailsMap.set(AntiVirusStatus.Active, {
      icon: CommonDefinition.ASSETS_SVG_STATE_RUNNING,
      label: antiVirusStatusLabel[AntiVirusStatus.Active],
      logsLinkFlag: true
    });
    this._antivirusStatusDetailsMap.set(AntiVirusStatus.Warning, {
      icon: CommonDefinition.ASSETS_SVG_STATE_RESTARTING,
      label: antiVirusStatusLabel[AntiVirusStatus.Warning],
      logsLinkFlag: true
    });
    this._antivirusStatusDetailsMap.set(AntiVirusStatus.Inactive, {
      icon: CommonDefinition.ASSETS_SVG_STATE_SUSPENDED,
      label: antiVirusStatusLabel[AntiVirusStatus.Inactive],
      logsLinkFlag: true
    });
    this._antivirusStatusDetailsMap.set(AntiVirusStatus.Error, {
      icon: CommonDefinition.ASSETS_SVG_STATE_STOPPED,
      label: antiVirusStatusLabel[AntiVirusStatus.Error],
      logsLinkFlag: true
    });
  }
}
