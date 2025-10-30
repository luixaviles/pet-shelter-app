import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ageFormat',
  standalone: true
})
export class AgeFormatPipe implements PipeTransform {
  transform(age: { years: number; months: number } | null | undefined): string {
    if (!age) {
      return '0 months';
    }

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

