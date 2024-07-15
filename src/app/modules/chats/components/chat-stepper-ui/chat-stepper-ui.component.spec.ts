import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatStepperUiComponent } from './chat-stepper-ui.component';

describe('ChatStepperUiComponent', () => {
  let component: ChatStepperUiComponent;
  let fixture: ComponentFixture<ChatStepperUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatStepperUiComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatStepperUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
