import {
  Component,
  OnDestroy,
  Input,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  ChangeDetectorRef,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  animateFactory,
  unsubscribeSafely,
  getSafeProperty
} from '@app/utilities';
import {
  McsResourceCatalog
} from '@app/models';
import {
  IMcsDataChange,
  CoreValidators
} from '@app/core';
import { McsFormGroupDirective } from '@app/shared';
import { ServerManageMedia } from './server-manage-media';

@Component({
  selector: 'mcs-server-manage-media',
  templateUrl: 'server-manage-media.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeIn
  ]
})

export class ServerManageMediaComponent implements OnInit, OnDestroy, IMcsDataChange<ServerManageMedia> {
  public fgCatalog: FormGroup<any>;
  public fcCatalogItem: FormControl<any>;

  @Input()
  public catalogs: McsResourceCatalog[];

  @Output()
  public dataChange = new EventEmitter<ServerManageMedia>();

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  private _mediaOutput: ServerManageMedia;
  private _destroySubject = new Subject<void>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder
  ) {
    this._mediaOutput = new ServerManageMedia();
  }

  public ngOnInit() {
    this._registerFormGroup();
    this.notifyDataChange();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.dataChange);
  }

  /**
   * Returns true when the form is valid
   */
  public get isFormValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  /**
   * Notifes the data change to output parameter
   */
  public notifyDataChange() {
    if (!this.isFormValid) { return; }

    this._mediaOutput.catalogItem = this.fcCatalogItem.value;
    this.dataChange.emit(this._mediaOutput);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Registers the form group controls
   */
  private _registerFormGroup(): void {
    // Register form control for catalog item
    this.fcCatalogItem = new FormControl<any>(null, [
      CoreValidators.required
    ]);
    this.fcCatalogItem.valueChanges
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this.notifyDataChange());

    // Form group settings
    this.fgCatalog = this._formBuilder.group({
      fcCatalogItem: this.fcCatalogItem
    });
  }
}
