import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('$Pages/home/home').then((m) => m.Home),
  },
  {
    path: 'collections',
    loadComponent: () => import('$Pages/collections/collections').then((m) => m.Collections),
  },
  {
    path: 'collections/:collectionSlug',
    loadComponent: () => import('$Pages/collection-products/collection-products').then((m) => m.CollectionProducts),
  },
  {
    path: 'product/:productSKU',
    loadComponent: () => import('$Pages/product/product').then((m) => m.ProductComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
