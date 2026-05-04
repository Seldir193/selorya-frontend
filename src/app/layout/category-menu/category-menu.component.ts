import { Component, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

type CategoryLink = {
  labelKey: string;
  value: string;
};

type CategoryColumn = {
  titleKey: string;
  links: CategoryLink[];
};

type CategoryMenuItem = {
  titleKey: string;
  descriptionKey: string;
  value: string;
  icon: string;
  columns: CategoryColumn[];
};

@Component({
  selector: 'app-category-menu',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './category-menu.component.html',
  styleUrl: './category-menu.component.scss',
})
export class CategoryMenuComponent {
  readonly isOpen = signal(false);
  readonly activeIndex = signal(0);

  readonly popularLinks: CategoryLink[] = [
    { labelKey: 'categoryPopularJackets', value: 'jackets' },
    { labelKey: 'categoryPopularSmartphones', value: 'smartphones' },
    { labelKey: 'categoryPopularSneakers', value: 'sneakers' },
    { labelKey: 'categoryPopularFurniture', value: 'furniture' },
    { labelKey: 'categoryPopularBags', value: 'bags' },
  ];

  readonly categories: CategoryMenuItem[] = [
    {
      titleKey: 'categoryFashionTitle',
      descriptionKey: 'categoryFashionDescription',
      value: 'fashion',
      icon: 'fashion',
      columns: [
        {
          titleKey: 'categoryColumnWomen',
          links: [
            { labelKey: 'categoryWomenClothing', value: 'women-clothing' },
            { labelKey: 'categoryWomenShoes', value: 'women-shoes' },
            { labelKey: 'categoryWomenBags', value: 'women-bags' },
            { labelKey: 'categoryJewelry', value: 'jewelry' },
          ],
        },
        {
          titleKey: 'categoryColumnMen',
          links: [
            { labelKey: 'categoryMenClothing', value: 'men-clothing' },
            { labelKey: 'categoryMenShoes', value: 'men-shoes' },
            { labelKey: 'categoryWatches', value: 'watches' },
            { labelKey: 'categoryAccessories', value: 'accessories' },
          ],
        },
        {
          titleKey: 'categoryColumnHighlights',
          links: [
            { labelKey: 'categorySneakers', value: 'sneakers' },
            { labelKey: 'categoryVintage', value: 'vintage' },
            { labelKey: 'categoryPremiumBrands', value: 'premium-brands' },
          ],
        },
      ],
    },
    {
      titleKey: 'categoryElectronicsTitle',
      descriptionKey: 'categoryElectronicsDescription',
      value: 'electronics',
      icon: 'electronics',
      columns: [
        {
          titleKey: 'categoryColumnDevices',
          links: [
            { labelKey: 'categorySmartphones', value: 'smartphones' },
            { labelKey: 'categoryLaptops', value: 'laptops' },
            { labelKey: 'categoryTablets', value: 'tablets' },
          ],
        },
        {
          titleKey: 'categoryColumnEntertainment',
          links: [
            { labelKey: 'categoryGaming', value: 'gaming' },
            { labelKey: 'categoryAudio', value: 'audio' },
            { labelKey: 'categoryCameras', value: 'cameras' },
          ],
        },
        {
          titleKey: 'categoryColumnAccessories',
          links: [
            { labelKey: 'categoryCables', value: 'cables' },
            { labelKey: 'categorySmartHome', value: 'smart-home' },
          ],
        },
      ],
    },
    {
      titleKey: 'categoryHomeTitle',
      descriptionKey: 'categoryHomeDescription',
      value: 'home-living',
      icon: 'home',
      columns: [
        {
          titleKey: 'categoryColumnLiving',
          links: [
            { labelKey: 'categoryFurniture', value: 'furniture' },
            { labelKey: 'categoryDecoration', value: 'decoration' },
            { labelKey: 'categoryLighting', value: 'lighting' },
          ],
        },
        {
          titleKey: 'categoryColumnHousehold',
          links: [
            { labelKey: 'categoryKitchen', value: 'kitchen' },
            { labelKey: 'categoryHousehold', value: 'household' },
            { labelKey: 'categoryGarden', value: 'garden' },
          ],
        },
      ],
    },
    {
      titleKey: 'categorySportTitle',
      descriptionKey: 'categorySportDescription',
      value: 'sport-leisure',
      icon: 'sport',
      columns: [
        {
          titleKey: 'categoryColumnSport',
          links: [
            { labelKey: 'categoryFitness', value: 'fitness' },
            { labelKey: 'categoryOutdoor', value: 'outdoor' },
            { labelKey: 'categoryBikes', value: 'bikes' },
          ],
        },
        {
          titleKey: 'categoryColumnLeisure',
          links: [
            { labelKey: 'categoryHobbies', value: 'hobbies' },
            { labelKey: 'categoryBooks', value: 'books' },
            { labelKey: 'categoryMusic', value: 'music' },
          ],
        },
      ],
    },
    {
      titleKey: 'categoryBeautyTitle',
      descriptionKey: 'categoryBeautyDescription',
      value: 'beauty',
      icon: 'beauty',
      columns: [
        {
          titleKey: 'categoryColumnBeauty',
          links: [
            { labelKey: 'categoryCosmetics', value: 'cosmetics' },
            { labelKey: 'categoryCare', value: 'care' },
            { labelKey: 'categoryPerfume', value: 'perfume' },
          ],
        },
      ],
    },
    {
      titleKey: 'categoryKidsTitle',
      descriptionKey: 'categoryKidsDescription',
      value: 'kids-baby',
      icon: 'kids',
      columns: [
        {
          titleKey: 'categoryColumnKids',
          links: [
            { labelKey: 'categoryKidsClothing', value: 'kids-clothing' },
            { labelKey: 'categoryToys', value: 'toys' },
            { labelKey: 'categoryBabyGear', value: 'baby-gear' },
          ],
        },
      ],
    },
    {
      titleKey: 'categoryCollectiblesTitle',
      descriptionKey: 'categoryCollectiblesDescription',
      value: 'collectibles',
      icon: 'collectibles',
      columns: [
        {
          titleKey: 'categoryColumnCollectibles',
          links: [
            { labelKey: 'categoryLimitedItems', value: 'limited-items' },
            { labelKey: 'categoryArt', value: 'art' },
            { labelKey: 'categoryTradingCards', value: 'trading-cards' },
          ],
        },
      ],
    },
  ];

  activeCategory(): CategoryMenuItem {
    return this.categories[this.activeIndex()];
  }

  toggleMenu(): void {
    this.isOpen.update((isOpen) => !isOpen);
  }

  closeMenu(): void {
    this.isOpen.set(false);
  }

  setActiveCategory(index: number): void {
    this.activeIndex.set(index);
  }

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('[data-category-menu]')) {
      this.closeMenu();
    }
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    this.closeMenu();
  }
}
