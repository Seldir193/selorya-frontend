import { Component, EventEmitter, HostListener, Output, signal } from '@angular/core';
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

type CategoryPromo = {
  imageSrc: string;
  titleKey: string;
  textKey: string;
  ctaKey: string;
};

type CategoryBenefit = {
  iconSrc: string;
  titleKey: string;
  textKey: string;
};

type CategoryMenuItem = {
  titleKey: string;
  descriptionKey: string;
  value: string;
  iconSrc: string;
  columns: CategoryColumn[];
  promo?: CategoryPromo;
  benefits?: CategoryBenefit[];
};

@Component({
  selector: 'app-category-menu',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './category-menu.component.html',
  styleUrl: './category-menu.component.scss',
})
export class CategoryMenuComponent {
  @Output() readonly menuOpenChange = new EventEmitter<boolean>();

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
      iconSrc: 'assets/icons/categories/fashion.svg',
      columns: [
        {
          titleKey: 'categoryColumnWomen',
          links: [
            { labelKey: 'categoryWomenClothing', value: 'women-clothing' },
            { labelKey: 'categoryWomenShoes', value: 'women-shoes' },
            { labelKey: 'categoryWomenBags', value: 'women-bags' },
            { labelKey: 'categoryJewelry', value: 'jewelry' },
            { labelKey: 'categoryAccessories', value: 'accessories' },
            { labelKey: 'categorySportswear', value: 'sportswear' },
            { labelKey: 'categorySwimwear', value: 'swimwear' },
            { labelKey: 'categoryLingerie', value: 'lingerie' },
            { labelKey: 'categoryMaternity', value: 'maternity' },
            { labelKey: 'categoryVintageFashion', value: 'vintage-fashion' },
          ],
        },
        {
          titleKey: 'categoryColumnMen',
          links: [
            { labelKey: 'categoryMenClothing', value: 'men-clothing' },
            { labelKey: 'categoryMenShoes', value: 'men-shoes' },
            { labelKey: 'categoryWatches', value: 'watches' },
            { labelKey: 'categoryAccessories', value: 'accessories-men' },
            { labelKey: 'categoryJacketsCoats', value: 'jackets-coats' },
            { labelKey: 'categorySuitsBlazers', value: 'suits-blazers' },
            { labelKey: 'categoryShirts', value: 'shirts' },
            { labelKey: 'categoryJeans', value: 'jeans' },
            { labelKey: 'categoryUnderwear', value: 'underwear' },
          ],
        },
        {
          titleKey: 'categoryColumnMore',
          links: [
            { labelKey: 'categoryKidsClothing', value: 'kids-clothing' },
            { labelKey: 'categoryKidsShoes', value: 'kids-shoes' },
            { labelKey: 'categoryBackpacks', value: 'backpacks' },
            { labelKey: 'categoryCapsHats', value: 'caps-hats' },
            { labelKey: 'categoryBelts', value: 'belts' },
            { labelKey: 'categorySunglasses', value: 'sunglasses' },
            { labelKey: 'categoryCostumes', value: 'costumes' },
            { labelKey: 'categorySustainableFashion', value: 'sustainable-fashion' },
            { labelKey: 'categoryBrandOverview', value: 'brand-overview' },
            { labelKey: 'categorySaleOffers', value: 'sale-offers' },
          ],
        },
      ],
      promo: {
        imageSrc: 'assets/images/category-fashion-card.jpg',
        titleKey: 'categoryFashionPromoTitle',
        textKey: 'categoryFashionPromoText',
        ctaKey: 'categoryFashionPromoCta',
      },
      benefits: [
        {
          iconSrc: 'assets/icons/categories/shield.svg',
          titleKey: 'categoryBenefitSecureTitle',
          textKey: 'categoryBenefitSecureText',
        },
        {
          iconSrc: 'assets/icons/categories/check-badge.svg',
          titleKey: 'categoryBenefitQualityTitle',
          textKey: 'categoryBenefitQualityText',
        },
        {
          iconSrc: 'assets/icons/categories/truck.svg',
          titleKey: 'categoryBenefitSustainableTitle',
          textKey: 'categoryBenefitSustainableText',
        },
        {
          iconSrc: 'assets/icons/categories/headset.svg',
          titleKey: 'categoryBenefitSupportTitle',
          textKey: 'categoryBenefitSupportText',
        },
      ],
    },
    {
      titleKey: 'categoryElectronicsTitle',
      descriptionKey: 'categoryElectronicsDescription',
      value: 'electronics',
      iconSrc: 'assets/icons/categories/electronics.svg',
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
      iconSrc: 'assets/icons/categories/home.svg',
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
      iconSrc: 'assets/icons/categories/sport.svg',
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
      iconSrc: 'assets/icons/categories/beauty.svg',
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
      iconSrc: 'assets/icons/categories/kids.svg',
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
      iconSrc: 'assets/icons/categories/collectibles.svg',
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
    const nextState = !this.isOpen();

    this.isOpen.set(nextState);
    this.menuOpenChange.emit(nextState);
  }

  closeMenu(): void {
    if (!this.isOpen()) {
      return;
    }

    this.isOpen.set(false);
    this.menuOpenChange.emit(false);
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

// import { Component, EventEmitter, HostListener, Output, signal } from '@angular/core';
// import { RouterLink } from '@angular/router';
// import { TranslatePipe } from '@ngx-translate/core';

// type CategoryLink = {
//   labelKey: string;
//   value: string;
// };

// type CategoryColumn = {
//   titleKey: string;
//   links: CategoryLink[];
// };

// // type CategoryMenuItem = {
// //   titleKey: string;
// //   descriptionKey: string;
// //   value: string;
// //   iconSrc: string;
// //   columns: CategoryColumn[];
// // };

// type CategoryPromo = {
//   imageSrc: string;
//   titleKey: string;
//   textKey: string;
//   ctaKey: string;
// };

// type CategoryBenefit = {
//   iconSrc: string;
//   titleKey: string;
//   textKey: string;
// };

// type CategoryMenuItem = {
//   titleKey: string;
//   descriptionKey: string;
//   value: string;
//   iconSrc: string;
//   columns: CategoryColumn[];
//   promo?: CategoryPromo;
//   benefits?: CategoryBenefit[];
// };

// @Component({
//   selector: 'app-category-menu',
//   standalone: true,
//   imports: [RouterLink, TranslatePipe],
//   templateUrl: './category-menu.component.html',
//   styleUrl: './category-menu.component.scss',
// })
// export class CategoryMenuComponent {
//   @Output() readonly menuOpenChange = new EventEmitter<boolean>();

//   readonly isOpen = signal(false);
//   readonly activeIndex = signal(0);

//   readonly popularLinks: CategoryLink[] = [
//     { labelKey: 'categoryPopularJackets', value: 'jackets' },
//     { labelKey: 'categoryPopularSmartphones', value: 'smartphones' },
//     { labelKey: 'categoryPopularSneakers', value: 'sneakers' },
//     { labelKey: 'categoryPopularFurniture', value: 'furniture' },
//     { labelKey: 'categoryPopularBags', value: 'bags' },
//   ];

//   readonly categories: CategoryMenuItem[] = [
//     {
//       titleKey: 'categoryFashionTitle',
//       descriptionKey: 'categoryFashionDescription',
//       value: 'fashion',
//       iconSrc: 'assets/icons/categories/fashion.svg',
//       columns: [
//         {
//           titleKey: 'categoryColumnWomen',
//           links: [
//             { labelKey: 'categoryWomenClothing', value: 'women-clothing' },
//             { labelKey: 'categoryWomenShoes', value: 'women-shoes' },
//             { labelKey: 'categoryWomenBags', value: 'women-bags' },
//             { labelKey: 'categoryJewelry', value: 'jewelry' },
//           ],
//         },
//         {
//           titleKey: 'categoryColumnMen',
//           links: [
//             { labelKey: 'categoryMenClothing', value: 'men-clothing' },
//             { labelKey: 'categoryMenShoes', value: 'men-shoes' },
//             { labelKey: 'categoryWatches', value: 'watches' },
//             { labelKey: 'categoryAccessories', value: 'accessories' },
//           ],
//         },
//         {
//           titleKey: 'categoryColumnHighlights',
//           links: [
//             { labelKey: 'categorySneakers', value: 'sneakers' },
//             { labelKey: 'categoryVintage', value: 'vintage' },
//             { labelKey: 'categoryPremiumBrands', value: 'premium-brands' },
//           ],
//         },
//       ],
//     },
//     {
//       titleKey: 'categoryElectronicsTitle',
//       descriptionKey: 'categoryElectronicsDescription',
//       value: 'electronics',
//       iconSrc: 'assets/icons/categories/electronics.svg',
//       columns: [
//         {
//           titleKey: 'categoryColumnDevices',
//           links: [
//             { labelKey: 'categorySmartphones', value: 'smartphones' },
//             { labelKey: 'categoryLaptops', value: 'laptops' },
//             { labelKey: 'categoryTablets', value: 'tablets' },
//           ],
//         },
//         {
//           titleKey: 'categoryColumnEntertainment',
//           links: [
//             { labelKey: 'categoryGaming', value: 'gaming' },
//             { labelKey: 'categoryAudio', value: 'audio' },
//             { labelKey: 'categoryCameras', value: 'cameras' },
//           ],
//         },
//         {
//           titleKey: 'categoryColumnAccessories',
//           links: [
//             { labelKey: 'categoryCables', value: 'cables' },
//             { labelKey: 'categorySmartHome', value: 'smart-home' },
//           ],
//         },
//       ],
//     },
//     {
//       titleKey: 'categoryHomeTitle',
//       descriptionKey: 'categoryHomeDescription',
//       value: 'home-living',
//       iconSrc: 'assets/icons/categories/home.svg',
//       columns: [
//         {
//           titleKey: 'categoryColumnLiving',
//           links: [
//             { labelKey: 'categoryFurniture', value: 'furniture' },
//             { labelKey: 'categoryDecoration', value: 'decoration' },
//             { labelKey: 'categoryLighting', value: 'lighting' },
//           ],
//         },
//         {
//           titleKey: 'categoryColumnHousehold',
//           links: [
//             { labelKey: 'categoryKitchen', value: 'kitchen' },
//             { labelKey: 'categoryHousehold', value: 'household' },
//             { labelKey: 'categoryGarden', value: 'garden' },
//           ],
//         },
//       ],
//     },
//     {
//       titleKey: 'categorySportTitle',
//       descriptionKey: 'categorySportDescription',
//       value: 'sport-leisure',
//       iconSrc: 'assets/icons/categories/sport.svg',
//       columns: [
//         {
//           titleKey: 'categoryColumnSport',
//           links: [
//             { labelKey: 'categoryFitness', value: 'fitness' },
//             { labelKey: 'categoryOutdoor', value: 'outdoor' },
//             { labelKey: 'categoryBikes', value: 'bikes' },
//           ],
//         },
//         {
//           titleKey: 'categoryColumnLeisure',
//           links: [
//             { labelKey: 'categoryHobbies', value: 'hobbies' },
//             { labelKey: 'categoryBooks', value: 'books' },
//             { labelKey: 'categoryMusic', value: 'music' },
//           ],
//         },
//       ],
//     },
//     {
//       titleKey: 'categoryBeautyTitle',
//       descriptionKey: 'categoryBeautyDescription',
//       value: 'beauty',
//       iconSrc: 'assets/icons/categories/beauty.svg',
//       columns: [
//         {
//           titleKey: 'categoryColumnBeauty',
//           links: [
//             { labelKey: 'categoryCosmetics', value: 'cosmetics' },
//             { labelKey: 'categoryCare', value: 'care' },
//             { labelKey: 'categoryPerfume', value: 'perfume' },
//           ],
//         },
//       ],
//     },
//     {
//       titleKey: 'categoryKidsTitle',
//       descriptionKey: 'categoryKidsDescription',
//       value: 'kids-baby',
//       iconSrc: 'assets/icons/categories/kids.svg',
//       columns: [
//         {
//           titleKey: 'categoryColumnKids',
//           links: [
//             { labelKey: 'categoryKidsClothing', value: 'kids-clothing' },
//             { labelKey: 'categoryToys', value: 'toys' },
//             { labelKey: 'categoryBabyGear', value: 'baby-gear' },
//           ],
//         },
//       ],
//     },
//     {
//       titleKey: 'categoryCollectiblesTitle',
//       descriptionKey: 'categoryCollectiblesDescription',
//       value: 'collectibles',
//       iconSrc: 'assets/icons/categories/collectibles.svg',
//       columns: [
//         {
//           titleKey: 'categoryColumnCollectibles',
//           links: [
//             { labelKey: 'categoryLimitedItems', value: 'limited-items' },
//             { labelKey: 'categoryArt', value: 'art' },
//             { labelKey: 'categoryTradingCards', value: 'trading-cards' },
//           ],
//         },
//       ],
//     },
//     {
//       titleKey: 'categoryFashionTitle',
//       descriptionKey: 'categoryFashionDescription',
//       value: 'fashion',
//       iconSrc: 'assets/icons/categories/fashion.svg',
//       columns: [
//         {
//           titleKey: 'categoryColumnWomen',
//           links: [
//             { labelKey: 'categoryWomenClothing', value: 'women-clothing' },
//             { labelKey: 'categoryWomenShoes', value: 'women-shoes' },
//             { labelKey: 'categoryWomenBags', value: 'women-bags' },
//             { labelKey: 'categoryJewelry', value: 'jewelry' },
//             { labelKey: 'categoryAccessories', value: 'accessories' },
//             { labelKey: 'categorySportswear', value: 'sportswear' },
//             { labelKey: 'categorySwimwear', value: 'swimwear' },
//             { labelKey: 'categoryLingerie', value: 'lingerie' },
//             { labelKey: 'categoryMaternity', value: 'maternity' },
//             { labelKey: 'categoryVintageFashion', value: 'vintage-fashion' },
//           ],
//         },
//         {
//           titleKey: 'categoryColumnMen',
//           links: [
//             { labelKey: 'categoryMenClothing', value: 'men-clothing' },
//             { labelKey: 'categoryMenShoes', value: 'men-shoes' },
//             { labelKey: 'categoryWatches', value: 'watches' },
//             { labelKey: 'categoryAccessories', value: 'accessories-men' },
//             { labelKey: 'categoryJacketsCoats', value: 'jackets-coats' },
//             { labelKey: 'categorySuitsBlazers', value: 'suits-blazers' },
//             { labelKey: 'categoryShirts', value: 'shirts' },
//             { labelKey: 'categoryJeans', value: 'jeans' },
//             { labelKey: 'categoryUnderwear', value: 'underwear' },
//           ],
//         },
//         {
//           titleKey: 'categoryColumnMore',
//           links: [
//             { labelKey: 'categoryKidsClothing', value: 'kids-clothing' },
//             { labelKey: 'categoryKidsShoes', value: 'kids-shoes' },
//             { labelKey: 'categoryBackpacks', value: 'backpacks' },
//             { labelKey: 'categoryCapsHats', value: 'caps-hats' },
//             { labelKey: 'categoryBelts', value: 'belts' },
//             { labelKey: 'categorySunglasses', value: 'sunglasses' },
//             { labelKey: 'categoryCostumes', value: 'costumes' },
//             { labelKey: 'categorySustainableFashion', value: 'sustainable-fashion' },
//             { labelKey: 'categoryBrandOverview', value: 'brand-overview' },
//             { labelKey: 'categorySaleOffers', value: 'sale-offers' },
//           ],
//         },
//       ],
//       promo: {
//         imageSrc: 'assets/images/category-fashion-card.jpg',
//         titleKey: 'categoryFashionPromoTitle',
//         textKey: 'categoryFashionPromoText',
//         ctaKey: 'categoryFashionPromoCta',
//       },
//       benefits: [
//         {
//           iconSrc: 'assets/icons/categories/shield.svg',
//           titleKey: 'categoryBenefitSecureTitle',
//           textKey: 'categoryBenefitSecureText',
//         },
//         {
//           iconSrc: 'assets/icons/categories/check-badge.svg',
//           titleKey: 'categoryBenefitQualityTitle',
//           textKey: 'categoryBenefitQualityText',
//         },
//         {
//           iconSrc: 'assets/icons/categories/truck.svg',
//           titleKey: 'categoryBenefitSustainableTitle',
//           textKey: 'categoryBenefitSustainableText',
//         },
//         {
//           iconSrc: 'assets/icons/categories/headset.svg',
//           titleKey: 'categoryBenefitSupportTitle',
//           textKey: 'categoryBenefitSupportText',
//         },
//       ],
//     },
//   ];

//   activeCategory(): CategoryMenuItem {
//     return this.categories[this.activeIndex()];
//   }

//   toggleMenu(): void {
//     const nextState = !this.isOpen();

//     this.isOpen.set(nextState);
//     this.menuOpenChange.emit(nextState);
//   }

//   closeMenu(): void {
//     if (!this.isOpen()) {
//       return;
//     }

//     this.isOpen.set(false);
//     this.menuOpenChange.emit(false);
//   }

//   setActiveCategory(index: number): void {
//     this.activeIndex.set(index);
//   }

//   @HostListener('document:click', ['$event'])
//   closeOnOutsideClick(event: MouseEvent): void {
//     const target = event.target as HTMLElement;

//     if (!target.closest('[data-category-menu]')) {
//       this.closeMenu();
//     }
//   }

//   @HostListener('document:keydown.escape')
//   closeOnEscape(): void {
//     this.closeMenu();
//   }
// }
