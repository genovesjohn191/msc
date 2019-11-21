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
  HidsStatus,
  McsServerHostSecurityHids,
  HidsProtectionLevel
} from '@app/models';
import {
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';
import { ServerServiceDetailBase } from '../server-service-detail.base';


type ServerHidsStatusDetails = {
  icon: string;
  label?: string;
};

@Component({
  selector: 'mcs-service-hids',
  templateUrl: './hids.component.html',
  host: {
    'class': 'block'
  }
})
export class ServiceHidsComponent extends ServerServiceDetailBase implements OnChanges, OnInit {

  @Input()
  public set hids(hids: McsServerHostSecurityHids) {
    this._hids = hids;
  }
  public get hids(): McsServerHostSecurityHids {
    return this._hids;
  }
  public hidsDetails$: Observable<ServerHidsStatusDetails>;

  private _hidsStatusDetailsMap: Map<HidsStatus, ServerHidsStatusDetails>;
  private _hids: McsServerHostSecurityHids;
  private _hidsDetailsChange: BehaviorSubject<ServerHidsStatusDetails>;

  constructor(private _translateService: TranslateService) {
    super(ServerServicesView.Hids);
    this._createStatusMap();
    let hidsStatusDetails = this._hidsStatusDetailsMap.get(HidsStatus.Inactive);
    this._hidsDetailsChange = new BehaviorSubject(hidsStatusDetails);
  }

  public ngOnChanges(changes: SimpleChanges) {
    let hids = changes['hids'];
    if (!isNullOrEmpty(hids) && this._hidsStatusDetailsMap.has(this._hids.status)) {
      let hidsStatusDetails = this._hidsStatusDetailsMap.get(this._hids.status);
      hidsStatusDetails.label = this._getStatusLabel(this._hids);

      this._hidsDetailsChange.next(hidsStatusDetails);
    }
  }

  public ngOnInit() {
    this._subscribeToHidsDetails();
  }

  /**
   * Returns the hids details as observable
   */
  private _subscribeToHidsDetails(): void {
    this.hidsDetails$ = this._hidsDetailsChange.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  /**
   * Returns the Status label based on the Status of the hids and its protetion level
   */
  private _getStatusLabel(hids: McsServerHostSecurityHids): string {
    if (hids.status === HidsStatus.Active && hids.mode === HidsProtectionLevel.Protect) {
      return this._translateService.instant('serverServices.hids.activeLabel.protect');
    }
    if (hids.status === HidsStatus.Active && hids.mode === HidsProtectionLevel.Detect) {
      return this._translateService.instant('serverServices.hids.activeLabel.detect');
    }
    return hids.statusMessage;
  }

  /**
   * Initializes the server hids status map
   */
  private _createStatusMap(): void {
    this._hidsStatusDetailsMap = new Map();

    this._hidsStatusDetailsMap.set(HidsStatus.Active, {
      icon: CommonDefinition.ASSETS_SVG_STATE_RUNNING
    });
    this._hidsStatusDetailsMap.set(HidsStatus.Warning, {
      icon: CommonDefinition.ASSETS_SVG_STATE_RESTARTING
    });
    this._hidsStatusDetailsMap.set(HidsStatus.Inactive, {
      icon: CommonDefinition.ASSETS_SVG_STATE_STOPPED
    });
    this._hidsStatusDetailsMap.set(HidsStatus.Error, {
      icon: CommonDefinition.ASSETS_SVG_STATE_STOPPED
    });
  }
}
