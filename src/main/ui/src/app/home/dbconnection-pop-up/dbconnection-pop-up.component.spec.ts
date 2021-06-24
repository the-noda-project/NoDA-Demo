import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbconnectionPopUpComponent } from './dbconnection-pop-up.component';

describe('DbconnectionPopUpComponent', () => {
  let component: DbconnectionPopUpComponent;
  let fixture: ComponentFixture<DbconnectionPopUpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbconnectionPopUpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbconnectionPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
