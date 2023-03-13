import {
  Observable,
  Subject
} from 'rxjs';
import {
  shareReplay,
  takeUntil
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { McsNotice } from '@app/models';
import {
  isNullOrUndefined,
  unsubscribeSafely
} from '@app/utilities';
import { NoticeDetailsService } from '../notice-details.component.service';


@Component({
  selector: 'mcs-notice-overview',
  templateUrl: './notice-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NoticeOverviewComponent implements OnInit, OnDestroy {
  public selectedNotice$: Observable<McsNotice>;
  private _destroySubject = new Subject<void>();

  public constructor(
    private _noticeDetailsService: NoticeDetailsService
  ) {
  }

  public ngOnInit(): void {
    this._subscribeToNoticeDetails();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public get timeZone(): string {
    let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if(isNullOrUndefined(timeZone) || !isNaN(+timeZone)){
      return 'Times displayed are in your local time zone.';
    }
    return 'Time Zone: ' + timeZone;
  }

  public cleanUpCustomHtml(html: string): string {
    let tempEl = document.createElement('div');
    tempEl.innerHTML = html;

    // make all links open in new window
    let links = tempEl.querySelectorAll('a');
    links.forEach(link => {
      if (!link.hasAttribute('target') || link.getAttribute('target') !== '_blank') {
        link.setAttribute('target', '_blank');
      }
    });

    // fix tables that have incorrect td/th elements
    let tables = tempEl.querySelectorAll('table');
    tables.forEach(table => {
      table.classList.add("custom-html");
      if (!table.querySelector('thead')) {
        let firstRow = table.querySelector('tbody tr');
        firstRow.parentNode.removeChild(firstRow);
        var newThead = document.createElement('thead');
        newThead.appendChild(firstRow);
        newThead.querySelectorAll('tr').forEach(row => {
          let tdElements = row.querySelectorAll('td');
          for (let i = 0; i < tdElements.length; i++) {
            let thElement = document.createElement("th");
            let tdContent = tdElements[i].innerHTML;
            thElement.innerHTML = tdContent;
            tdElements[i].parentNode.replaceChild(thElement, tdElements[i]);
          }
        });
        table.prepend(newThead);
      }
    });

    return tempEl.innerHTML;
  }

  private _subscribeToNoticeDetails(): void {
    this.selectedNotice$ = this._noticeDetailsService.getNoticeDetails().pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }
}
