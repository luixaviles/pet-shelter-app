import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'pet/list',
    loadComponent: () => import('./components/pet-list/pet-list.component').then(m => m.PetListComponent)
  },
  {
    path: 'pet/add',
    loadComponent: () => import('./components/add-pet/add-pet.component').then(m => m.AddPetComponent)
  },
  {
    path: 'pet/:id',
    loadComponent: () => import('./components/pet-detail/pet-detail.component').then(m => m.PetDetailComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
