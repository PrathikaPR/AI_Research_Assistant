import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Flowchart } from './flowchart';

describe('Flowchart', () => {
  let component: Flowchart;
  let fixture: ComponentFixture<Flowchart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Flowchart],
    }).compileComponents();

    fixture = TestBed.createComponent(Flowchart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
