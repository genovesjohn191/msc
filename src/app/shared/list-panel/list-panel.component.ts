import {
  Component,
  QueryList,
  ContentChildren,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef,
  AfterContentInit,
  OnDestroy
} from '@angular/core';
import {
  Subject,
  Observable,
  merge,
  defer
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  isNullOrEmpty,
  unsubscribeSubject
} from '../../utilities';
import { OptionComponent } from '../option-group/option/option.component';
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

  @ContentChildren(OptionGroupComponent, { descendants: true })
  private _optionGroups: QueryList<OptionGroupComponent>;

  @ContentChildren(OptionComponent, { descendants: true })
  private _options: QueryList<OptionComponent>;
  private _destroySubject = new Subject<void>();

  /**
   * Combine streams of all option selection change
   */
  private readonly _optionsSelectionChanges: Observable<OptionComponent> = defer(() => {
    return merge(...this._options.map((option) => option.selectionChange));
  });

  constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  public ngAfterContentInit(): void {
    this._options.changes.pipe(takeUntil(this._destroySubject))
      .subscribe(() => this._listenToOptionsSelectionChange());
  }

  public ngOnDestroy(): void {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Listens to every selection of option to close the previous selection
   */
  private _listenToOptionsSelectionChange(): void {
    // Drops the current subscriptions and resets from scratch
    let resetSubject = merge(this._options.changes, this._destroySubject);

    this._optionsSelectionChanges.pipe(takeUntil(resetSubject))
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
}
