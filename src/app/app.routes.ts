import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'c/:token',
    loadComponent: () =>
      import('./portal/customer-page.component').then((m) => m.CustomerPageComponent),
  },
  {
    path: 'c/:token/idea/:id',
    loadComponent: () =>
      import('./portal/idea-detail.component').then((m) => m.IdeaDetailComponent),
  },
  {
    path: 'c/:token/case/:useCaseId',
    loadComponent: () =>
      import('./portal/use-case-detail.component').then((m) => m.UseCaseDetailComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./portal/app-home.component').then((m) => m.HomeComponent),
    pathMatch: 'full',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./portal/customer-page.component').then((m) => m.CustomerPageComponent),
  },
];
