import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementsForm } from './movements-form';

describe('MovementsForm', () => {
  let component: MovementsForm;
  let fixture: ComponentFixture<MovementsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovementsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovementsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
