import { Component } from '@angular/core';
import { ShellComponent } from './layout/shell/shell.component';

@Component({
  selector: 'app-root',
  imports: [ShellComponent],
  template: '<app-shell />',
  styleUrl: './app.scss',
})
export class App {}
