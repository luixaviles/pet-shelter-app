import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-github-ribbon',
  imports: [CommonModule],
  templateUrl: './github-ribbon.component.html',
  styleUrls: ['./github-ribbon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GithubRibbonComponent {
  readonly githubUrl = 'https://github.com/luixaviles/pet-shelter-app';
}

