import {
  Component,
  ViewChild
} from '@angular/core';
import {
  async,
  TestBed
} from '@angular/core/testing';
import { CoreTestingModule } from '@app/core/testing';
import { GridComponent } from './grid.component';
import { GridModule } from './grid.module';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild(GridComponent, { static: false })
  public targetComponent: GridComponent;
}

describe('GridComponent', () => {
  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent
      ],
      imports: [
        CoreTestingModule,
        GridModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <mcs-grid>
          <mcs-grid-row>
            <mcs-grid-column></mcs-grid-column>
            <mcs-grid-column></mcs-grid-column>
            <mcs-grid-column></mcs-grid-column>
            <mcs-grid-column></mcs-grid-column>
          </mcs-grid-row>
        </mcs-grid>
        `
      }
    });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-grid element`, () => {
      let element = document.querySelector('mcs-grid');
      expect(element).not.toBe(null);
    });

    it(`should create the mcs-grid-row element`, () => {
      let element = document.querySelector('mcs-grid-row');
      expect(element).not.toBe(null);
    });

    it(`should create the mcs-grid-column elements`, () => {
      let elements = document.querySelectorAll('mcs-grid-column');
      expect(elements.length).toBe(4);
    });
  });
});
