import {
  async,
  TestBed,
  tick,
  fakeAsync
} from '@angular/core/testing';
import { SearchComponent } from './search.component';
import { CoreTestingModule } from '../../core/testing';

describe('SearchComponent', () => {

  /** Stub Services/Components */
  let component: SearchComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        SearchComponent
      ],
      imports: [
        CoreTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(SearchComponent, {
      set: {
        template: `
          <div>SearchComponent Template</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(SearchComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('onChangeKeyEvent()', () => {
    beforeEach(fakeAsync(() => {
      spyOn(component.searchChangedStream, 'next');
      component.onChangeKeyEvent('A');
      tick(component.delayInSeconds as number);
    }));

    it(`should notify the searchChangedStream subscribers when key is pressed.`, () => {
      expect(component.searchChangedStream.next).toHaveBeenCalledTimes(1);
    });

    it(`should set the keyword to "A".`, () => {
      expect(component.keyword).toBe('A');
    });
  });

  describe('onEnterKeyUpEvent()', () => {
    beforeEach(fakeAsync(() => {
      spyOn(component.searchChangedStream, 'next');
      component.onEnterKeyUpEvent('B');
      tick(component.delayInSeconds as number);
    }));

    it(`should notify the searchChangedStream subscribers when key is pressed.`, () => {
      expect(component.searchChangedStream.next).toHaveBeenCalledTimes(1);
    });

    it(`should set the keyword to "B".`, () => {
      expect(component.keyword).toBe('B');
    });
  });
});
