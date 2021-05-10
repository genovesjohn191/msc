import {
  Component,
  Inject,
  OnInit
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { McsTerraformDeployment, McsTerraformTag } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap } from 'rxjs/operators';
import { FlatOption, GroupedOption } from '../dynamic-form';

export interface ConfirmationDialogData {
  title: string;
  deployment: McsTerraformDeployment,
  availableTags: McsTerraformTag[],
  newTag: string;
}

@Component({
  selector: 'mcs-terraform-tag-change-dialog.component',
  templateUrl: './terraform-tag-change-dialog.component.html'
})
export class TerraformTagChangeDialogComponent implements OnInit {
  public filteredOptions: Observable<GroupedOption[]>;
  public filterControl = new FormControl();

  public get valid(): boolean {
    return !isNullOrEmpty(this.data.newTag) && this.data.newTag !== this.data.deployment.tag;
  };

  public constructor(
    public dialogRef: MatDialogRef<TerraformTagChangeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  public ngOnInit(): void {
    this._initializeFiltering();
  }

  private _filter(collection: McsTerraformTag[], searchKeyword: string): GroupedOption[] {
    let groupedOptions: GroupedOption[] = [];

    collection.forEach((item) => {
      if (!isNullOrEmpty(searchKeyword)) {
        let nameHasKeyword: boolean = item.name.toLowerCase().indexOf(searchKeyword) >= 0;
        if (!nameHasKeyword) { return; }
      }

      let groupName = item.categoryName;
      let existingGroup = groupedOptions.find((opt) => opt.name === groupName);

      let key = item.id;
      let value = item.name;

      let option = { key, value } as FlatOption;

      if (existingGroup) {
        // Add option to existing group
        existingGroup.options.push(option);
      } else {
        // Add option to new group
        groupedOptions.push({
          type: 'group',
          name: groupName,
          options: [option]
        });
      }
    });

    return groupedOptions;
  }

  private _initializeFiltering(): void {
    this.filteredOptions = this.filterControl.valueChanges
    .pipe(
      startWith(null as void),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((value) => {
        this.data.newTag = '';
        // Do not proceed with empty search
        if (isNullOrEmpty(value)) { return []; };

        let result = this.data.availableTags.find((tag) => tag.name === value);
        if (result) { this.data.newTag = result.id; }

        return of(this._filter(this.data.availableTags, value));
      }));
  }
}
