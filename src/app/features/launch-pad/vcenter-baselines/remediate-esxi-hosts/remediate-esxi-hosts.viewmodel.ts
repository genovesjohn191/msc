import { Injector } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  CoreValidators,
  McsViewModelBase
} from '@app/core';
import {
  McsVCenterBaseline,
  McsVCenterBaselineRemediate
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';

export class RemediateEsxiHostsViewModel extends McsViewModelBase {
  public fcCompany: FormControl<string>;
  public fcVCenter: FormControl<string>;
  public fcBaseline: FormControl<string>;
  public fcDatacentre: FormControl<string>;
  public fcHosts: FormControl<string[]>;

  constructor(injector: Injector) {
    super(injector);

    this.fcCompany = new FormControl<string>('', []);
    this.fcVCenter = new FormControl<string>('', []);
    this.fcBaseline = new FormControl<string>('', [
      CoreValidators.required
    ]);
    this.fcDatacentre = new FormControl<string>('', []);
    this.fcHosts = new FormControl<string[]>([], [
      CoreValidators.required
    ]);

    this.registerControls({
      fcCompany: this.fcCompany,
      fcVCenter: this.fcVCenter,
      fcBaseline: this.fcBaseline,
      fcDataCentre: this.fcDatacentre,
      fcHosts: this.fcHosts
    });
  }

  public get baselineId(): string {
    return this.fcBaseline?.value;
  }

  public get forUpdate(): boolean {
    return !isNullOrEmpty(this.baselineId);
  }

  public updateViewModel(baseline: McsVCenterBaseline): void {
    if (isNullOrEmpty(baseline)) { return; }

    this.fcCompany.setValue(baseline.vCenter?.companyId);
    this.fcVCenter.setValue(baseline.vCenter?.id);
    this.fcBaseline.setValue(baseline.id);
  }

  public generateApiModel(): McsVCenterBaselineRemediate {
    let request = new McsVCenterBaselineRemediate();
    let hostIds = this.fcHosts?.value ?? [];
    request.hostIds = hostIds;

    if (this.forUpdate) {
      request.clientReferenceObject = {
        baselineId: this.baselineId,
        hostIds: hostIds
      }
    }
    return request;
  }
}