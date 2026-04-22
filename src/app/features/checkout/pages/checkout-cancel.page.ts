import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-checkout-cancel-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './checkout-cancel.page.html',
  styleUrls: ['./checkout-cancel.page.scss'],
})
export class CheckoutCancelPage {}
