import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AskAi } from './ask-ai';

describe('AskAi', () => {
  let component: AskAi;
  let fixture: ComponentFixture<AskAi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AskAi],
    }).compileComponents();

    fixture = TestBed.createComponent(AskAi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
