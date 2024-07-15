import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatRromComponent } from './chat-rrom.component';

describe('ChatRromComponent', () => {
  let component: ChatRromComponent;
  let fixture: ComponentFixture<ChatRromComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatRromComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatRromComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
