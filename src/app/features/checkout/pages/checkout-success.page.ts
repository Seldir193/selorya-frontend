import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-checkout-success-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './checkout-success.page.html',
  styleUrls: ['./checkout-success.page.scss'],
})
export class CheckoutSuccessPage {}
