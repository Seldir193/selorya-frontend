import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {}
