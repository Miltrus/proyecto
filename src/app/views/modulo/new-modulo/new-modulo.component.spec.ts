import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewModuloComponent } from './new-modulo.component';

describe('NewModuloComponent', () => {
  let component: NewModuloComponent;
  let fixture: ComponentFixture<NewModuloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewModuloComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewModuloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
