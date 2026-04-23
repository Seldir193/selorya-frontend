import { Injectable, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class CheckoutReturnService {
  private readonly route = inject(ActivatedRoute);

  provider(): string {
    return this.route.snapshot.queryParamMap.get('provider') ?? '';
  }

  sessionId(): string {
    return this.route.snapshot.queryParamMap.get('session_id') ?? '';
  }
}
