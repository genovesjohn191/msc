import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnInit,
  ChangeDetectorRef,
  Output,
  EventEmitter
} from '@angular/core';
import {
  Subject,
  throwError
} from 'rxjs';
import {
  catchError,
  takeUntil
} from 'rxjs/operators';
import {
  McsCompany,
  McsContactUs
} from '@app/models';
import { McsApiService } from '@app/services';
import { CommonDefinition } from '@app/utilities';

@Component({
  selector: 'mcs-contact-us-widget',
  templateUrl: './contact-us-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})

export class ContactUsWidgetComponent implements OnInit {

  private _baseDestroySubject = new Subject<void>();
  public contactsInfo: McsCompany;
  public processing: boolean = false;
  public hasError: boolean = false;

  public get contactPersonIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_PERSON_FAV_BLACK;
  }

  @Output()
  public dataChange= new EventEmitter<McsContactUs[]>(null);

  constructor(
    private _apiService: McsApiService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getUserContactsInfo();
  }

  public getUserContactsInfo(): void {
    this.processing = true;
    this.hasError = false;
    this.dataChange.emit(undefined);
    this._apiService.getCompanyActiveUser()
    .pipe(
      catchError(() => {
        this.hasError = true;
        this.processing = false;
        this.dataChange.emit([]);
        this._changeDetectorRef.markForCheck();
        return throwError('Contact Us endpoint failed.');
      }),
      takeUntil(this._baseDestroySubject))
    .subscribe((response) => {
        this.contactsInfo = response;
        this.dataChange.emit(this.contactsInfo.contacts);
        this.processing = false;
        this._changeDetectorRef.markForCheck();
    });
  }
}

