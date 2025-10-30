import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { PetService } from '../../services/pet.service';
import { Pet } from '../../models/pet.model';

@Component({
  selector: 'app-pet-detail',
  imports: [CommonModule, RouterLink, NgOptimizedImage, FormsModule],
  templateUrl: './pet-detail.component.html',
  styleUrls: ['./pet-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetDetailComponent implements OnInit {
  pet$!: Observable<Pet | undefined>;
  selectedLanguage: 'en' | 'es' | 'fr' = 'en';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private petService = inject(PetService);

  ngOnInit(): void {
    this.pet$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          this.router.navigate(['/']);
          return [];
        }
        return this.petService.getPetById(id);
      })
    );
  }

  onAdopt(pet: Pet): void {
    alert(`Thank you for your interest in adopting ${pet.name}! Our adoption team will contact you within 24 hours to begin the process.`);
  }
}
