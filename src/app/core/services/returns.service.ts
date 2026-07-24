import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import {
  ShipmentReturn,
  ShipmentReturnDecisionPayload,
  ShipmentReturnRequestPayload,
  ShipmentReturnShippingPayload,
} from '../models/return.model';

@Injectable({ providedIn: 'root' })
export class ReturnsService {
  private readonly http = inject(HttpClient);

  requestReturn(
    shipmentId: number,
    payload: ShipmentReturnRequestPayload,
  ): Observable<ShipmentReturn> {
    return this.http.post<ShipmentReturn>(
      `${API_BASE_URL}/orders/shipments/${shipmentId}/returns/`,
      payload,
    );
  }

  resolveReturn(
    returnId: number,
    payload: ShipmentReturnDecisionPayload,
  ): Observable<ShipmentReturn> {
    return this.http.post<ShipmentReturn>(
      `${API_BASE_URL}/orders/shipment-returns/${returnId}/resolve/`,
      payload,
    );
  }

  shipReturn(
    returnId: number,
    payload: ShipmentReturnShippingPayload,
  ): Observable<ShipmentReturn> {
    return this.http.post<ShipmentReturn>(
      `${API_BASE_URL}/orders/shipment-returns/${returnId}/ship/`,
      payload,
    );
  }

  confirmReturnDelivery(returnId: number): Observable<ShipmentReturn> {
    return this.http.post<ShipmentReturn>(
      `${API_BASE_URL}/orders/shipment-returns/${returnId}/confirm-delivery/`,
      {},
    );
  }
}
