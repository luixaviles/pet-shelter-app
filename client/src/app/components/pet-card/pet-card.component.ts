import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Pet } from '../../models/pet.model';

@Component({
  selector: 'app-pet-card',
  imports: [CommonModule, RouterLink, NgOptimizedImage],
  templateUrl: './pet-card.component.html',
  styleUrls: ['./pet-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetCardComponent {
  pet = input.required<Pet>();

  onAdopt(): void {
    alert(`Thank you for your interest in adopting ${this.pet().name}! Our team will contact you soon.`);
  }

  formatAge(age: { years: number; months: number }): string {
    const parts: string[] = [];
    if (age.years > 0) {
      parts.push(`${age.years} ${age.years === 1 ? 'year' : 'years'}`);
    }
    if (age.months > 0) {
      parts.push(`${age.months} ${age.months === 1 ? 'month' : 'months'}`);
    }
    return parts.length > 0 ? parts.join(' ') : '0 months';
  }
}
