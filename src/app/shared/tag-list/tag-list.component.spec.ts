import {
  Component,
  ViewChild,
  ViewChildren,
  QueryList
} from '@angular/core';
import {
  async,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';
import { CoreTestingModule } from '../../core/testing';
import { triggerEvent } from '../../utilities';
import { FormFieldModule } from '../form-field/form-field.module';
import { TagListComponent } from './tag-list.component';
import { TagComponent } from './tag/tag.component';
import { TagListModule } from './tag-list.module';
import { TagInputDirective } from './tag-input/tag-input.directive';

@Component({
  selector: 'mcs-test-chip-list',
  template: ``
})
export class TestTagListComponent {
  @ViewChild(TagListComponent)
  public tagListComponent: TagListComponent;

  @ViewChildren(TagComponent)
  public tagItems: QueryList<TagComponent>;

  public selectedValue: any;
  public fruits = [
    { name: 'Lemon' },
    { name: 'Lime' },
    { name: 'Apple' },
  ];

  public addTag(_tagInput: TagInputDirective) {
    if (!_tagInput) { return; }
    // Add the value of the input element
    this.fruits.push({ name: _tagInput.inputElement.value });

    // Reset the input element
    _tagInput.inputElement.value = '';
  }

  public remove(fruit: any): void {
    let index = this.fruits.indexOf(fruit);

    if (index >= 0) {
      this.fruits.splice(index, 1);
    }
  }
}

describe('TagListComponent', () => {

  /** Stub Services/Components */
  let component: TestTagListComponent;
  let fixture: ComponentFixture<TestTagListComponent>;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestTagListComponent
      ],
      imports: [
        FormFieldModule,
        CoreTestingModule,
        TagListModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestTagListComponent, {
      set: {
        template: `
        <mcs-form-field>
          <mcs-tag-list>
            <!-- Tag -->
            <mcs-tag *ngFor="let fruit of fruits"
              [selectable]="true" [removable]="true" (removed)="remove(fruit)">
              {{fruit.name}}
            </mcs-tag>

            <!-- Input -->
            <input placeholder="New fruit..."
              mcsTagInput
              [mcsTagInputSeparatorKeys]="separatorKeysCodes"
              [mcsTagInputAddOnBlur]="true"
              (mcsTagInputOnAdd)="addTag($event)" />
          </mcs-tag-list>
        </mcs-form-field>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(TestTagListComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.tagListComponent.ngAfterContentInit();
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-tag-list element`, () => {
      let element: any;
      element = document.querySelector('mcs-tag-list');
      expect(element).not.toBe(null);
    });

    it(`should create the mcs-tag element`, () => {
      let element: any;
      element = document.querySelector('mcs-tag');
      expect(element).not.toBe(null);
    });

    it(`should set the value to undefined`, () => {
      expect(component.tagListComponent.value).toBeUndefined();
    });
  });

  describe('onFocus() onBlur()', () => {
    it(`should set the focus flag to true`, () => {
      triggerEvent(component.tagListComponent.elementRef.nativeElement, 'focus');
      expect(component.tagListComponent.focused).toBeTruthy();
    });

    it(`should set the focus flag to false`, () => {
      triggerEvent(component.tagListComponent.elementRef.nativeElement, 'blur');
      expect(component.tagListComponent.focused).toBeFalsy();
    });
  });

  describe('isEmpty()', () => {
    it(`should return true when no tag yet is selected`, () => {
      expect(component.tagListComponent.isEmpty).toBeTruthy();
    });
  });
});
