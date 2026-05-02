import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './global-search.component.html',
  styleUrl: './global-search.component.scss',
})
export class GlobalSearchComponent {
  readonly query = signal('');

  constructor(private readonly router: Router) {}

  updateQuery(value: string): void {
    this.query.set(value);
  }

  submitSearch(): void {
    const search = this.query().trim();

    if (!search) {
      return;
    }

    this.router.navigate(['/listings'], {
      queryParams: { search },
    });
  }
}
