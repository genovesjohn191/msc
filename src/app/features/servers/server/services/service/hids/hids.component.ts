import {
  OnChanges,
  Input,
  Component,
  SimpleChanges
} from '@angular/core';
import {
  ServerServicesView,
  HidsStatus,
  hidsStatusLabel,
  McsServerHostSecurityHids
} from '@app/models';
import {
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';
import { ServiceDetailViewBase } from '../service-detail-view.base';


type ServerHidsStatusDetails = {
  icon: string;
  label: string;
  logsLinkFlag: boolean;
};

@Component({
  selector: 'mcs-service-hids',
  templateUrl: './hids.component.html',
  host: {
    'class': 'block'
  }
})
export class ServiceHidsComponent extends ServiceDetailViewBase implements OnChanges {

  @Input()
  public set hids(hids: McsServerHostSecurityHids) {
    this._hids = hids;
  }
  public get hids(): McsServerHostSecurityHids {
    return this._hids;
  }

  private _hidsStatusDetailsMap: Map<HidsStatus, ServerHidsStatusDetails>;
  private _hidsStatusDetails: ServerHidsStatusDetails;
  private _hids: McsServerHostSecurityHids;

  constructor() {
    super(ServerServicesView.Hids);
    this._createStatusMap();
    this._hidsStatusDetails = this._hidsStatusDetailsMap.get(HidsStatus.Warning);
  }

  public ngOnChanges(changes: SimpleChanges) {
    let hids = changes['hids'];
    if (!isNullOrEmpty(hids)) {
      this._hidsStatusDetails = this._hidsStatusDetailsMap.get(this._hids.status);
    }
  }

  public get statusIcon(): string {
    return this._hidsStatusDetails.icon;
  }

  public get statusLabel(): string {
    return this._hidsStatusDetails.label;
  }

  public get statusLogsLinkFlag(): boolean {
    return this._hidsStatusDetails.logsLinkFlag;
  }

  /**
   * Initializes the server hids status map
   */
  private _createStatusMap(): void {
    this._hidsStatusDetailsMap = new Map();

    this._hidsStatusDetailsMap.set(HidsStatus.Active, {
      icon: CommonDefinition.ASSETS_SVG_STATE_RUNNING,
      label: hidsStatusLabel[HidsStatus.Active],
      logsLinkFlag: true
    });
    this._hidsStatusDetailsMap.set(HidsStatus.Warning, {
      icon: CommonDefinition.ASSETS_SVG_STATE_RESTARTING,
      label: hidsStatusLabel[HidsStatus.Warning],
      logsLinkFlag: true
    });
    this._hidsStatusDetailsMap.set(HidsStatus.Inactive, {
      icon: CommonDefinition.ASSETS_SVG_STATE_SUSPENDED,
      label: hidsStatusLabel[HidsStatus.Inactive],
      logsLinkFlag: true
    });
    this._hidsStatusDetailsMap.set(HidsStatus.Error, {
      icon: CommonDefinition.ASSETS_SVG_STATE_STOPPED,
      label: hidsStatusLabel[HidsStatus.Error],
      logsLinkFlag: true
    });
  }
}
