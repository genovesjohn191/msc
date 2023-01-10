import {
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';
import {
  waitForAsync,
  ComponentFixture,
  TestBed,
  fakeAsync
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CoreTestingModule } from '@app/core/testing';
import { ResizableColumnDirective } from './resizable-column.directive';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild('testElement')
  public testElement: ElementRef;

  @ViewChild(ResizableColumnDirective)
  public directive: ResizableColumnDirective;
}

describe('ResizableColumnDirective', () => {

  /** Stub Services/Components */
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        ResizableColumnDirective
      ],
      imports: [
        CoreTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>ResizableColumnDirective Template</div>
        <div #testElement class="listing-table-wrapper resizable-table-wrapper">
          <!-- Table -->
          <table mat-table>
            <thead>
              <th mat-header-cell [mcsResizable]="true" style="width:100px;">
                Column A
              </th>
            </thead>
            <tr mat-row>
              <td mat-cell>
                <span>Test data</span>
              </td>
            </tr>
          </table>
        </div>
        `
      }
    });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the component`, () => {
      expect(component).toBeDefined();
    });

    it(`should create the resizer element`, () => {
      const resizeHolderElem = fixture.debugElement.query(By.css('.resize-holder'));
      
      expect(resizeHolderElem).toBeTruthy();
    });

  });

});
