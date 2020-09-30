import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerRequestPatchComponent } from './server-request-patch.component';

describe('RequestPatchComponent', () => {
  let component: ServerRequestPatchComponent;
  let fixture: ComponentFixture<ServerRequestPatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServerRequestPatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerRequestPatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
