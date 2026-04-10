import { Component, ChangeDetectionStrategy } from '@angular/core';


@Component({
  selector: 'app-github-ribbon',
  imports: [],
  templateUrl: './github-ribbon.component.html',
  styleUrls: ['./github-ribbon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GithubRibbonComponent {
  readonly githubUrl = 'https://github.com/luixaviles/pet-shelter-app';
}

