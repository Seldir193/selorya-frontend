import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FavoritesService } from '../../../core/services/favorites.service';
import { Favorite } from '../../../core/models/favorite.model';

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './favorites.page.html',
  styleUrl: './favorites.page.scss',
})
export class FavoritesPage {
  private readonly favoritesService = inject(FavoritesService);

  readonly favorites = signal<Favorite[]>([]);
  readonly isLoading = signal(true);

  constructor() {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.favoritesService.list().subscribe({
      next: (favorites) => {
        this.favorites.set(favorites);
        this.isLoading.set(false);
      },
      error: () => {
        this.favorites.set([]);
        this.isLoading.set(false);
      },
    });
  }

  removeFavorite(favoriteId: number): void {
    this.favoritesService.delete(favoriteId).subscribe({
      next: () => {
        this.favorites.update((favorites) =>
          favorites.filter((favorite) => favorite.id !== favoriteId),
        );
      },
    });
  }
}
