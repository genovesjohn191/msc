import {
  Component,
  Inject,
  OnInit
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { McsNetworkDnsZone } from '@app/models';
import { CommonDefinition } from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

export interface DnsZoneTtlEditDialogData {
  title: string;
  message: string;
  zone: McsNetworkDnsZone;
  ttlSeconds: number;
}

@Component({
  selector: 'mcs-dns-zone-ttl-edit-dialog.component',
  templateUrl: './dns-zone-ttl-edit-dialog.component.html',
  styleUrls: [ './dns-zone-dialogs.scss' ],
})
export class DnsZoneTtlEditDialogComponent implements OnInit {
  public minValue: number = 600;
  public maxValue: number = 2147483647;
  public form: FormGroup<any>;
  public fcTtlSecondsInput: FormControl<any>;

  public get valid(): boolean {
    return this.form.valid && this.data.ttlSeconds !== this.data.zone.ttlSeconds;
  };

  public get errorMessage(): string {
    if(this.fcTtlSecondsInput.hasError('min')) return this._translateService.instant('message.validationMin') + this.minValue;
    if(this.fcTtlSecondsInput.hasError('max')) return this._translateService.instant('message.validationMax') + this.maxValue;
    if(this.fcTtlSecondsInput.hasError('pattern')) return this._translateService.instant('message.validationIntOnly');
  }
  public constructor(
    public dialogRef: MatDialogRef<DnsZoneTtlEditDialogComponent>,
    private _translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: DnsZoneTtlEditDialogData
  ) {}

  public ngOnInit(): void {
    this.fcTtlSecondsInput = new FormControl<any>(Validators.required,
      [ Validators.min(this.minValue), Validators.max(this.maxValue), Validators.pattern(CommonDefinition.REGEX_INTEGER_PATTERN) ]);
    this.form = new FormGroup<any>({
      fcTtlSecondsInput: this.fcTtlSecondsInput
    });
  }

}
