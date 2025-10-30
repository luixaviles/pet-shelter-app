import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/pet-list/pet-list.component').then(m => m.PetListComponent)
  },
  {
    path: 'pet/:id',
    loadComponent: () => import('./components/pet-detail/pet-detail.component').then(m => m.PetDetailComponent)
  },
  {
    path: 'add-pet',
    loadComponent: () => import('./components/add-pet/add-pet.component').then(m => m.AddPetComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
