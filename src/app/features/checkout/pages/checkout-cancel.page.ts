import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CheckoutReturnService } from '../../../core/services/checkout-return.service';

@Component({
  selector: 'app-checkout-cancel-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './checkout-cancel.page.html',
  styleUrls: ['./checkout-cancel.page.scss'],
})
export class CheckoutCancelPage {
  readonly checkoutReturn = inject(CheckoutReturnService);
}
