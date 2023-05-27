import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPermisoComponent } from './new-permiso.component';

describe('NewPermisoComponent', () => {
  let component: NewPermisoComponent;
  let fixture: ComponentFixture<NewPermisoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewPermisoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewPermisoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
