import { Component, HostListener, input, output } from '@angular/core';

export type DialogSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-dialog',
  standalone: true,
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogComponent {
  readonly isOpen = input.required<boolean>();
  readonly title = input('');
  readonly ariaLabel = input('');
  readonly size = input<DialogSize>('md');
  readonly closeOnBackdrop = input(true);
  readonly close = output<void>();

  closeDialog(): void {
    this.close.emit();
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop()) {
      this.closeDialog();
    }
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    if (this.isOpen()) {
      this.closeDialog();
    }
  }
}
