import { Component, HostListener, computed, input, output, signal } from '@angular/core';

export type DropdownOption<T extends string | number = string | number> = {
  value: T;
  label: string;
};

@Component({
  selector: 'app-dropdown',
  standalone: true,
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
})
export class DropdownComponent<T extends string | number = string | number> {
  readonly value = input.required<T>();
  readonly options = input.required<DropdownOption<T>[]>();
  readonly ariaLabel = input('');
  readonly minWidth = input('154px');
  readonly maxMenuHeight = input('none');

  readonly valueChange = output<T>();

  readonly isOpen = signal(false);

  readonly selectedLabel = computed(() => {
    return this.options().find((option) => option.value === this.value())?.label ?? '';
  });

  toggleMenu(): void {
    this.isOpen.update((isOpen) => !isOpen);
  }

  selectOption(value: T): void {
    this.valueChange.emit(value);
    this.closeMenu();
  }

  closeMenu(): void {
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  closeMenuOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('[data-app-dropdown]')) {
      this.closeMenu();
    }
  }
}
