import {
  Component,
  ElementRef,
  HostListener,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type SelectValue = string | number;

export type SelectOption = {
  value: SelectValue;
  label: string;
};

@Component({
  selector: 'app-form-select',
  standalone: true,
  templateUrl: './form-select.component.html',
  styleUrl: './form-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormSelectComponent),
      multi: true,
    },
  ],
})
export class FormSelectComponent implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly options = input<SelectOption[]>([]);
  readonly required = input(false);

  readonly isOpen = signal(false);
  readonly selectedValue = signal<SelectValue | null>(null);
  readonly isDisabled = signal(false);

  readonly selectedLabel = computed(() => {
    return this.getSelectedLabel();
  });

  private onChange: (value: SelectValue | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  writeValue(value: SelectValue | null): void {
    this.selectedValue.set(value);
  }

  registerOnChange(fn: (value: SelectValue | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  toggle(): void {
    if (this.isDisabled()) {
      return;
    }

    this.isOpen.update((value) => !value);
    this.onTouched();
  }

  selectOption(option: SelectOption): void {
    this.selectedValue.set(option.value);
    this.onChange(option.value);
    this.close();
  }

  private close(): void {
    this.isOpen.set(false);
  }

  private getSelectedLabel(): string {
    const value = this.selectedValue();
    return this.options().find((option) => option.value === value)?.label ?? '';
  }
}
