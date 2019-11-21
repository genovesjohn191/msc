import {
  OnChanges,
  Input,
  Component,
  SimpleChanges,
  OnInit
} from '@angular/core';
import {
  Observable,
  BehaviorSubject
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import {
  ServerServicesView,
  AntiVirusStatus,
  McsServerHostSecurityAntiVirus
} from '@app/models';
import {
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';
import { ServerServiceDetailBase } from '../server-service-detail.base';


type ServerAntiVirusStatusDetails = {
  icon: string;
  label?: string;
};

@Component({
  selector: 'mcs-service-anti-virus',
  templateUrl: './anti-virus.component.html',
  host: {
    'class': 'block'
  }
})
export class ServiceAntiVirusComponent extends ServerServiceDetailBase implements OnChanges, OnInit {

  @Input()
  public set antivirus(antivirus: McsServerHostSecurityAntiVirus) {
    this._antivirus = antivirus;
  }
  public get antivirus(): McsServerHostSecurityAntiVirus {
    return this._antivirus;
  }
  public antiVirusDetails$: Observable<ServerAntiVirusStatusDetails>;

  private _antivirusStatusDetailsMap: Map<AntiVirusStatus, ServerAntiVirusStatusDetails>;
  private _antivirus: McsServerHostSecurityAntiVirus;
  private _antiVirusDetailsChange: BehaviorSubject<ServerAntiVirusStatusDetails>;

  constructor(private _translateService: TranslateService) {
    super(ServerServicesView.AntiVirus);
    this._createStatusMap();
    let antiVirusStatusDetails = this._antivirusStatusDetailsMap.get(AntiVirusStatus.Inactive);
    this._antiVirusDetailsChange = new BehaviorSubject(antiVirusStatusDetails);
  }

  public ngOnChanges(changes: SimpleChanges) {
    let antivirus = changes['antivirus'];
    if (!isNullOrEmpty(antivirus) && this._antivirusStatusDetailsMap.has(this._antivirus.status)) {
      let antiVirusStatusDetails = this._antivirusStatusDetailsMap.get(this._antivirus.status);
      antiVirusStatusDetails.label = this._getStatusLabel(this._antivirus);

      this._antiVirusDetailsChange.next(antiVirusStatusDetails);
    }
  }

  public ngOnInit() {
    this._subscribeToAvDetails();
  }

  /**
   * Returns the anti virus details as observable
   */
  private _subscribeToAvDetails(): void {
    this.antiVirusDetails$ = this._antiVirusDetailsChange.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  /**
   * Returns the Status label based on the Status of the av and its properties
   */
  private _getStatusLabel(hids: McsServerHostSecurityAntiVirus): string {
    if (hids.status === AntiVirusStatus.Active && hids.realTimeScanEnabled) {
      return this._translateService.instant('serverServices.antivirus.activeLabel.realtimeScanEnabled');
    }
    if (hids.status === AntiVirusStatus.Active && !hids.realTimeScanEnabled) {
      return this._translateService.instant('serverServices.antivirus.activeLabel.realtimeScanDisabled');
    }
    return hids.statusMessage;
  }

  /**
   * Initializes the server antivirus status map
   */
  private _createStatusMap(): void {
    this._antivirusStatusDetailsMap = new Map();

    this._antivirusStatusDetailsMap.set(AntiVirusStatus.Active, {
      icon: CommonDefinition.ASSETS_SVG_STATE_RUNNING
    });
    this._antivirusStatusDetailsMap.set(AntiVirusStatus.Warning, {
      icon: CommonDefinition.ASSETS_SVG_STATE_RESTARTING
    });
    this._antivirusStatusDetailsMap.set(AntiVirusStatus.Inactive, {
      icon: CommonDefinition.ASSETS_SVG_STATE_STOPPED
    });
    this._antivirusStatusDetailsMap.set(AntiVirusStatus.Error, {
      icon: CommonDefinition.ASSETS_SVG_STATE_STOPPED
    });
  }
}
