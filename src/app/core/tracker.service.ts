import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';

export type TrackEventType =
  | 'page_view'
  | 'section_dwell'
  | 'demo_request'
  | 'link_click'
  | 'image_click'
  | 'navigation'
  | 'outbound_click';

const SESSION_KEY = 'fb_session_id';

@Injectable({ providedIn: 'root' })
export class TrackerService {
  private readonly http = inject(HttpClient);
  private token: string | null = null;

  setToken(token: string): void {
    this.token = token;
  }

  track(
    eventType: TrackEventType,
    payload: Record<string, unknown> = {},
    interactionId?: string,
  ): void {
    const body: Record<string, unknown> = {
      sessionId: this.sessionId(),
      eventType,
      payload,
    };
    if (this.token) body['token'] = this.token;
    if (interactionId) body['interactionId'] = interactionId;

    this.http
      .post(`${environment.apiBaseUrl}/portal/track`, body)
      .subscribe({ error: () => {} }); // fire-and-forget; never interrupt UX
  }

  /** Returns ms elapsed since the given timestamp — used for dwell time. */
  elapsed(since: number): number {
    return Date.now() - since;
  }

  private sessionId(): string {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }
}
