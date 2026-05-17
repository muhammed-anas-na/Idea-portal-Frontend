import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PortalProduct {
  name: string;
  url: string;
  logoUrl: string | null;
}

export interface PortalAnswer {
  contentHtml: string;
  product: PortalProduct | null;
}

export interface PortalInteraction {
  id: string;
  kind: 'post' | 'comment' | 'reply' | 'vote';
  sourceUrl: string;
  sourceId: string | null;
  occurredOn: string | null;
  title: string;
  body: string | null;
  voteCount: number;
  commentCount: number;
}

export interface PortalCommunityComment {
  id: string;
  kind: 'post' | 'comment' | 'reply';
  title: string;
  body: string | null;
  occurredOn: string | null;
}

export interface PortalCommunityActivity {
  voteCount: number;
  totalComments: number;
  comments: PortalCommunityComment[];
}

export interface PortalUseCase {
  id: string;
  title: string;
  summary: string | null;
  product: PortalProduct | null;
}

export interface PortalPage {
  introHtml: string;
  outroHtml: string;
  accentColor: string | null;
  calendlyUrl: string | null;
  isPublished: boolean;
}

export interface PortalData {
  linkId: string;
  name: string;
  targetInteractionId: string | null;
  page: PortalPage | null;
  interactions: PortalInteraction[];
  useCases: PortalUseCase[];
}

export interface PortalDetailPage {
  accentColor: string | null;
  calendlyUrl: string | null;
  outroHtml: string;
}

export type PortalOtherIdea = Omit<PortalInteraction, 'sourceId'>;

export interface PortalIdeaDetail {
  linkId: string;
  customerName: string;
  page: PortalDetailPage | null;
  interaction: PortalInteraction & { answer: PortalAnswer };
  communityActivity: PortalCommunityActivity | null;
  otherIdeas: PortalOtherIdea[];
}

export interface PortalCaseDetail {
  linkId: string;
  customerName: string;
  page: PortalDetailPage | null;
  useCase: {
    id: string;
    title: string;
    summary: string | null;
    contentHtml: string;
    product: PortalProduct | null;
  };
}

@Injectable({ providedIn: 'root' })
export class PortalApi {
  private readonly http = inject(HttpClient);

  getByToken(token: string): Observable<PortalData> {
    return this.http.get<PortalData>(`${environment.apiBaseUrl}/portal/c/${token}`);
  }

  getIdeaDetail(token: string, interactionId: string): Observable<PortalIdeaDetail> {
    return this.http.get<PortalIdeaDetail>(
      `${environment.apiBaseUrl}/portal/c/${token}/idea/${interactionId}`,
    );
  }

  getCaseDetail(token: string, useCaseId: string): Observable<PortalCaseDetail> {
    return this.http.get<PortalCaseDetail>(
      `${environment.apiBaseUrl}/portal/c/${token}/case/${useCaseId}`,
    );
  }
}
