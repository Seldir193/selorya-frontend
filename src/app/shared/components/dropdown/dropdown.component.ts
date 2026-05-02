import { Component, HostListener, computed, input, output, signal } from '@angular/core';

export type DropdownOption<T extends string | number = string | number> = {
  value: T;
  label: string;
  triggerLabel?: string;
};

export type DropdownAlign = 'left' | 'right';
export type DropdownItemAlign = 'left' | 'center';

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
  readonly align = input<DropdownAlign>('left');
  readonly itemAlign = input<DropdownItemAlign>('center');
  readonly disabled = input(false);
  readonly closeOnSelect = input(true);

  readonly valueChange = output<T>();

  readonly isOpen = signal(false);

  readonly selectedLabel = computed(() => {
    return this.options().find((option) => option.value === this.value())?.label ?? '';
  });

  readonly selectedTriggerLabel = computed(() => {
    const selectedOption = this.options().find((option) => option.value === this.value());
    return selectedOption?.triggerLabel ?? selectedOption?.label ?? '';
  });

  toggleMenu(): void {
    if (this.disabled()) {
      return;
    }

    this.isOpen.update((isOpen) => !isOpen);
  }

  selectOption(value: T): void {
    this.valueChange.emit(value);

    if (this.closeOnSelect()) {
      this.closeMenu();
    }
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
