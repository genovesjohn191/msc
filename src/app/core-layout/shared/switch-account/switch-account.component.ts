import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  CoreDefinition,
  McsApiCompany
} from '../../../core';
import { Subscription } from 'rxjs/Rx';
import { isNullOrEmpty } from '../../../utilities';
import { SwitchAccountService } from './switch-account.service';

@Component({
  selector: 'mcs-switch-account',
  templateUrl: './switch-account.component.html',
  styleUrls: ['./switch-account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SwitchAccountComponent implements OnInit, OnDestroy {

  @Output()
  public selectionChanged: EventEmitter<any>;

  // TODO: Add Paging and filtering of data
  public companies: McsApiCompany[];
  public recentCompanies: McsApiCompany[];
  public activeAccount: McsApiCompany;

  // Subscriptions
  public companiesSubscription: Subscription;
  public recentCompaniesSubscription: Subscription;
  public activeAccountSubscription: Subscription;

  /**
   * Panel is opened when the value is true, otherwise fale/close
   */
  private _panelOpen: boolean;
  public get panelOpen(): boolean {
    return this._panelOpen;
  }
  public set panelOpen(value: boolean) {
    if (this._panelOpen !== value) {
      this._panelOpen = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  // Icons
  public get chevronTopIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_UP;
  }

  public get arrowUpBueIconKey(): string {
    return CoreDefinition.ASSETS_SVG_ARROW_UP_BLUE;
  }

  public get arrowRightBueIconKey(): string {
    return CoreDefinition.ASSETS_SVG_ARROW_RIGHT_BLUE;
  }

  public get userIconKey(): string {
    // TODO: Change the color to red based on the company status
    return CoreDefinition.ASSETS_SVG_PERSON_GREEN;
  }

  constructor(
    private _switchAccountService: SwitchAccountService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.selectionChanged = new EventEmitter();
  }

  public ngOnInit(): void {
    // Listen to any change on the company mapping
    this._listenToCompanies();
    this._listenToRecentCompanies();
    this._listenToActiveCompany();
  }

  public ngOnDestroy(): void {
    if (!isNullOrEmpty(this.companiesSubscription)) {
      this.companiesSubscription.unsubscribe();
    }
    if (!isNullOrEmpty(this.recentCompaniesSubscription)) {
      this.recentCompaniesSubscription.unsubscribe();
    }
    if (!isNullOrEmpty(this.activeAccountSubscription)) {
      this.activeAccountSubscription.unsubscribe();
    }
  }

  public get defaultAccount(): McsApiCompany {
    return this._switchAccountService.defaultAccount;
  }

  public onClickAccount(account: McsApiCompany): void {
    if (isNullOrEmpty(account)) { return; }
    this._switchAccountService.switchAccount(account);
  }

  public getTextFormat(company: McsApiCompany): string {
    if (isNullOrEmpty(company)) { return ''; }
    return `${company.name}(${company.id})`;
  }

  /**
   * Track by function to help determine the view which data has beed modified
   * @param index Index of the current loop
   * @param _item Item of the loop
   */
  public trackByFn(index: any, _item: any) {
    return index;
  }

  public togglePanel(): void {
    this.panelOpen = this.panelOpen ? false : true;
    // Add rotation of the caret
  }

  public selectAccount(account: McsApiCompany): void {
    if (isNullOrEmpty(account)) { return; }
    this._switchAccountService.switchAccount(account);
    this.selectionChanged.emit(account);
  }

  private _listenToCompanies(): void {
    this.companiesSubscription = this._switchAccountService.companiesStream
      .subscribe((companies) => {
        this.companies = companies;
        this._changeDetectorRef.markForCheck();
      });
  }

  private _listenToRecentCompanies(): void {
    this.recentCompaniesSubscription = this._switchAccountService.recentCompaniesStream
      .subscribe((recent) => {
        this.recentCompanies = recent;
        this._changeDetectorRef.markForCheck();
      });
  }

  private _listenToActiveCompany(): void {
    this.activeAccountSubscription = this._switchAccountService.activeAccountStream
      .subscribe((active) => {
        this.activeAccount = active;
        this._changeDetectorRef.markForCheck();
      });
  }
}
