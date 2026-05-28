import { Component, computed, input, output } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { DropdownComponent, DropdownOption } from '../dropdown/dropdown.component';

type PaginationVariant = 'default' | 'compact';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [DropdownComponent],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly totalItems = input.required<number>();
  readonly pageSizeOptions = input<number[]>([10, 20, 50, 100]);
  readonly showPageSize = input(true);
  readonly variant = input<PaginationVariant>('default');

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  readonly totalPages = computed(() => this.getTotalPages());
  readonly hasItems = computed(() => this.totalItems() > 0);
  readonly pageSizeDropdownOptions = computed<DropdownOption<number>[]>(() => {
    return this.pageSizeOptions().map((option) => ({
      value: option,
      label: String(option),
    }));
  });

  constructor(private readonly i18n: I18nService) {}

  text(key: string): string {
    return this.i18n.t(key);
  }

  previousPage(): void {
    this.emitPage(this.page() - 1);
  }

  nextPage(): void {
    this.emitPage(this.page() + 1);
  }

  changePageSize(value: number): void {
    this.pageSizeChange.emit(value);
  }

  private emitPage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.pageChange.emit(page);
  }

  private getTotalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems() / this.pageSize()));
  }
}

// import { Component, computed, input, output } from '@angular/core';
// import { I18nService } from '../../../core/services/i18n.service';
// import { DropdownComponent, DropdownOption } from '../dropdown/dropdown.component';

// @Component({
//   selector: 'app-pagination',
//   standalone: true,
//   imports: [DropdownComponent],
//   templateUrl: './pagination.component.html',
//   styleUrl: './pagination.component.scss',
// })
// export class PaginationComponent {
//   readonly page = input.required<number>();
//   readonly pageSize = input.required<number>();
//   readonly totalItems = input.required<number>();
//   readonly pageSizeOptions = input<number[]>([10, 20, 50, 100]);
//   readonly showPageSize = input(true);

//   readonly pageChange = output<number>();
//   readonly pageSizeChange = output<number>();

//   readonly totalPages = computed(() => this.getTotalPages());
//   readonly hasItems = computed(() => this.totalItems() > 0);
//   readonly pageSizeDropdownOptions = computed<DropdownOption<number>[]>(() => {
//     return this.pageSizeOptions().map((option) => ({
//       value: option,
//       label: String(option),
//     }));
//   });

//   constructor(private readonly i18n: I18nService) {}

//   text(key: string): string {
//     return this.i18n.t(key);
//   }

//   previousPage(): void {
//     this.emitPage(this.page() - 1);
//   }

//   nextPage(): void {
//     this.emitPage(this.page() + 1);
//   }

//   changePageSize(value: number): void {
//     this.pageSizeChange.emit(value);
//   }

//   private emitPage(page: number): void {
//     if (page < 1 || page > this.totalPages()) {
//       return;
//     }

//     this.pageChange.emit(page);
//   }

//   private getTotalPages(): number {
//     return Math.max(1, Math.ceil(this.totalItems() / this.pageSize()));
//   }
// }
