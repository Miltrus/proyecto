import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListModulosComponent } from './list-modulos.component';

describe('ListModulosComponent', () => {
  let component: ListModulosComponent;
  let fixture: ComponentFixture<ListModulosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListModulosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListModulosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
