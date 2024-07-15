import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chats2Component } from './chats2.component';

describe('Chats2Component', () => {
  let component: Chats2Component;
  let fixture: ComponentFixture<Chats2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Chats2Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Chats2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
