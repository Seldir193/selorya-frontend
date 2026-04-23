import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CheckoutReturnService } from '../../../core/services/checkout-return.service';

@Component({
  selector: 'app-checkout-success-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './checkout-success.page.html',
  styleUrls: ['./checkout-success.page.scss'],
})
export class CheckoutSuccessPage {
  readonly checkoutReturn = inject(CheckoutReturnService);
}
