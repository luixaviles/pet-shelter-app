import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { PetService } from '../../services/pet.service';
import { Pet, AnimalTypeFilter, GenderFilter } from '../../models/pet.model';
import { PetCardComponent } from '../pet-card/pet-card.component';

@Component({
  selector: 'app-pet-list',
  imports: [CommonModule, PetCardComponent],
  templateUrl: './pet-list.component.html',
  styleUrls: ['./pet-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetListComponent implements OnInit {
  filteredPets$!: Observable<Pet[]>;
  currentAnimalType: AnimalTypeFilter = 'all';
  currentGender: GenderFilter = 'all';

  private petService = inject(PetService);

  ngOnInit(): void {
    this.filteredPets$ = this.petService.filteredPets$;
  }

  setAnimalTypeFilter(filter: AnimalTypeFilter): void {
    this.currentAnimalType = filter;
    this.petService.setAnimalTypeFilter(filter);
  }

  setGenderFilter(filter: GenderFilter): void {
    this.currentGender = filter;
    this.petService.setGenderFilter(filter);
  }
}
