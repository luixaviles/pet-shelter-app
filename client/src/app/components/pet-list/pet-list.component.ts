import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { PetService } from '../../services/pet.service';
import { AnimalTypeFilter, GenderFilter } from '../../models/pet.model';
import { PetCardComponent } from '../pet-card/pet-card.component';

@Component({
  selector: 'app-pet-list',
  imports: [PetCardComponent],
  templateUrl: './pet-list.component.html',
  styleUrls: ['./pet-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetListComponent {
  private petService = inject(PetService);

  readonly filteredPets = this.petService.filteredPets;
  readonly currentAnimalType = this.petService.animalTypeFilter;
  readonly currentGender = this.petService.genderFilter;

  setAnimalTypeFilter(filter: AnimalTypeFilter): void {
    this.petService.setAnimalTypeFilter(filter);
  }

  setGenderFilter(filter: GenderFilter): void {
    this.petService.setGenderFilter(filter);
  }
}
