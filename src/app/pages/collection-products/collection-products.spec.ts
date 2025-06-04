import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionProducts } from './collection-products';

describe('CollectionProducts', () => {
  let component: CollectionProducts;
  let fixture: ComponentFixture<CollectionProducts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionProducts],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionProducts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
