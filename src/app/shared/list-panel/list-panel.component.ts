import {
  Component,
  Input,
  QueryList,
  ContentChildren,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef,
  AfterContentInit,
  OnDestroy
} from '@angular/core';
import { Subject, Observable } from 'rxjs';
import {
  startWith,
  takeUntil
} from 'rxjs/operators';
import { OptionComponent } from '../option-group/option/option.component';
import { isNullOrEmpty } from '../../utilities';
import { OptionGroupComponent } from '../option-group/option-group.component';

@Component({
  selector: 'mcs-list-panel',
  templateUrl: './list-panel.component.html',
  styleUrls: ['./list-panel.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'list-panel-wrapper'
  }
})

export class ListPanelComponent implements AfterContentInit, OnDestroy {

  @Input()
  public initialSelected: any;

  @ContentChildren(OptionGroupComponent, { descendants: true })
  private _optionGroups: QueryList<OptionGroupComponent>;

  @ContentChildren(OptionComponent, { descendants: true })
  private _options: QueryList<OptionComponent>;
  private _destroySubject = new Subject<void>();

  /**
   * Combine streams of all option selection change
   */
  public get optionsSelectionChange(): Observable<OptionComponent> {
    return Observable.merge(...this._options.map((option) => option.selectionChange));
  }

  constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  public ngAfterContentInit(): void {
    this._options.changes.pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(() => {
        this._selectOptionByValue(this.initialSelected);
        this._listenToOptionsSelectionChange();
      });
  }

  public ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  /**
   * Listens to every selection of option to close the previous selection
   */
  private _listenToOptionsSelectionChange(): void {
    this.optionsSelectionChange.pipe(takeUntil(this._destroySubject))
      .subscribe((option: OptionComponent) => {
        this._closeGroupsPanel(option);
        this._clearOptionSelection(option);
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Closes all group panel elements and ignore who has the child of active option
   */
  private _closeGroupsPanel(_activeOption: OptionComponent): void {
    if (isNullOrEmpty(this._optionGroups)) { return; }
    this._optionGroups.forEach((optionGroup) => {
      let hasOption = optionGroup.hasOption(_activeOption);
      if (hasOption) { return; }
      optionGroup.closePanel();
    });
  }

  /**
   * Clears the selection of option element
   * @param _activeOption Current active option that remains opened
   */
  private _clearOptionSelection(_activeOption: OptionComponent): void {
    if (isNullOrEmpty(this._options)) { return; }
    this._options.forEach((option) => {
      if (option === _activeOption) { return; }
      option.removeSelectedState();
    });
  }

  /**
   * Sets the selection based on the value provided
   * @param value Value to be selected
   */
  private _selectOptionByValue(value: any): void {
    if (isNullOrEmpty(value)) { return; }
    let optionExist = this._options.find((option) => option.value === value);
    if (!isNullOrEmpty(optionExist)) {
      optionExist.onClick();
    }
  }
}
