import { Component, HostListener, computed, input, output, signal } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly totalItems = input.required<number>();
  readonly pageSizeOptions = input<number[]>([10, 20, 50, 100]);

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  readonly isPageSizeMenuOpen = signal(false);
  readonly totalPages = computed(() => this.getTotalPages());
  readonly hasItems = computed(() => this.totalItems() > 0);

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

  togglePageSizeMenu(): void {
    this.isPageSizeMenuOpen.update((isOpen) => !isOpen);
  }

  changePageSize(value: number): void {
    this.pageSizeChange.emit(value);
    this.closePageSizeMenu();
  }

  closePageSizeMenu(): void {
    this.isPageSizeMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  closeMenuOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('[data-pagination-dropdown]')) {
      this.closePageSizeMenu();
    }
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
