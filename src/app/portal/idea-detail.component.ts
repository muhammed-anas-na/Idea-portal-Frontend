import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PortalApi, PortalIdeaDetail, PortalOtherIdea } from '../core/portal.api';
import { TrackerService } from '../core/tracker.service';

const KIND_LABEL: Record<string, string> = {
  post: 'Idea', comment: 'Comment', reply: 'Reply', vote: 'Vote',
};
const KIND_ICON: Record<string, string> = {
  post: '💡', comment: '💬', reply: '↩️', vote: '👍',
};

@Component({
  selector: 'fb-idea-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-screen" *ngIf="loading()">
      <div class="spinner"></div>
    </div>

    <div class="not-found" *ngIf="!loading() && !detail()">
      <div class="not-found-inner">
        <div class="nf-logo">Feebak</div>
        <h1>Idea not found</h1>
        <p>This idea may have been removed or hasn't been published yet.</p>
        <button class="back-link-btn" (click)="goBack()">← Back to ideas</button>
      </div>
    </div>

    <ng-container *ngIf="detail() as d">
      <!-- Header -->
      <header class="site-header">
        <div class="header-inner">
          <div class="header-brand">
            <span class="brand-logo">Feebak</span>
            <span class="brand-divider"></span>
            <span class="brand-tagline">Ideas Portal</span>
          </div>
          <nav class="header-nav">
            <span class="header-customer">{{ d.customerName }}</span>
            <a *ngIf="d.page?.calendlyUrl" class="demo-btn"
              [href]="d.page!.calendlyUrl!" target="_blank" rel="noopener"
              [style.background]="accent(d)" (click)="trackDemoClick(d)">
              Request a Demo
            </a>
          </nav>
        </div>
      </header>

      <!-- Back + breadcrumb -->
      <div class="breadcrumb-bar">
        <div class="breadcrumb-inner">
          <button class="back-btn" (click)="goBack()">
            ← Back to all ideas
          </button>
          <span class="breadcrumb-sep">·</span>
          <span class="breadcrumb-name">{{ d.customerName }}</span>
        </div>
      </div>

      <main class="detail-wrapper">
        <div class="detail-inner">

          <!-- Idea card — full width -->
          <section class="idea-section">
            <div class="idea-header">
              <div class="idea-meta">
                <span class="kind-pill" data-kind="post">
                  💡 Idea
                </span>
                <span *ngIf="d.interaction.occurredOn" class="idea-date">
                  {{ d.interaction.occurredOn | date:'MMM d, y' }}
                </span>
              </div>
              <a *ngIf="d.interaction.sourceUrl" class="source-link"
                [href]="d.interaction.sourceUrl" target="_blank" rel="noopener"
                (click)="trackOutbound(d.interaction.sourceUrl)">
                View original →
              </a>
            </div>
            <h1 class="idea-title">{{ d.interaction.title }}</h1>
            <p *ngIf="d.interaction.body" class="idea-body">{{ d.interaction.body }}</p>
          </section>

          <!-- Two-column: answer (75%) + community (25%) -->
          <div class="two-col">

            <!-- Left: Feebak's Solution -->
            <section class="answer-section" [style.--accent]="accent(d)">
              <div class="answer-header">
                <div class="answer-badge">
                  <span class="answer-dot" [style.background]="accent(d)"></span>
                  Feebak's Solution
                </div>
                <a *ngIf="d.interaction.answer.product"
                  class="product-badge"
                  [href]="d.interaction.answer.product.url"
                  target="_blank" rel="noopener"
                  (click)="trackOutbound(d.interaction.answer.product!.url)">
                  {{ d.interaction.answer.product.name }} ↗
                </a>
              </div>
              <div class="answer-body rich-text"
                [innerHTML]="d.interaction.answer.contentHtml"></div>

              <div class="answer-cta" *ngIf="d.page?.calendlyUrl">
                <p>Want to see this in action?</p>
                <a class="cta-btn" [href]="d.page!.calendlyUrl!" target="_blank" rel="noopener"
                  [style.background]="accent(d)" (click)="trackDemoClick(d)">
                  Book a Demo
                </a>
              </div>
            </section>

            <!-- Right: Community activity -->
            <aside class="community-aside" *ngIf="d.communityActivity">
              <div class="community-header">
                <h2 class="section-label">Community</h2>
                <div class="community-stats">
                  <span class="comm-stat comm-stat-vote" *ngIf="d.communityActivity!.voteCount">
                    👍 {{ d.communityActivity!.voteCount }}
                  </span>
                  <span class="comm-stat comm-stat-comment" *ngIf="d.communityActivity!.totalComments">
                    💬 {{ d.communityActivity!.totalComments }}
                  </span>
                </div>
              </div>
              <div class="community-list" *ngIf="d.communityActivity!.comments.length > 0">
                <div class="community-item" *ngFor="let c of d.communityActivity!.comments">
                  <div class="community-item-meta">
                    <span class="kind-pill" [attr.data-kind]="c.kind">
                      {{ kindIcon(c.kind) }} {{ kindLabel(c.kind) }}
                    </span>
                    <span *ngIf="c.occurredOn" class="related-date">{{ c.occurredOn | date:'MMM d, y' }}</span>
                  </div>
                  <p class="related-body" *ngIf="c.body">{{ c.body }}</p>
                  <p class="related-body no-body" *ngIf="!c.body">{{ c.title }}</p>
                </div>
              </div>
              <p class="no-comments" *ngIf="d.communityActivity!.comments.length === 0 && !d.communityActivity!.voteCount">
                No community activity yet.
              </p>
            </aside>

          </div>

        </div>
      </main>

      <!-- Other ideas strip -->
      <section class="other-ideas-section" *ngIf="detail()?.otherIdeas?.length">
        <div class="other-ideas-inner">
          <div class="other-ideas-head">
            <h2 class="other-ideas-title">Other ideas you've commented on</h2>
            <button class="view-all-btn" (click)="goBack()">View all ideas →</button>
          </div>
          <div class="other-ideas-grid">
            <article
              *ngFor="let it of detail()!.otherIdeas"
              class="other-idea-card"
              (click)="openOtherIdea(it)"
              (keydown.enter)="openOtherIdea(it)"
              tabindex="0"
              role="button"
            >
              <div class="oi-meta">
                <span class="kind-pill" [attr.data-kind]="it.kind">
                  {{ kindIcon(it.kind) }} {{ kindLabel(it.kind) }}
                </span>
                <span *ngIf="it.occurredOn" class="oi-date">{{ it.occurredOn | date:'MMM d, y' }}</span>
              </div>
              <p class="oi-title">{{ it.title }}</p>
              <span class="oi-cta" [style.color]="accent(detail()!)">See Feebak's answer →</span>
            </article>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="outro-section">
        <div class="outro-inner">
          <div *ngIf="d.page?.outroHtml" class="outro-body rich-text"
            [innerHTML]="d.page!.outroHtml"></div>
          <div class="cta-block" *ngIf="d.page?.calendlyUrl">
            <h3>Ready to see Feebak in action?</h3>
            <a class="cta-btn-large" [href]="d.page!.calendlyUrl!" target="_blank" rel="noopener"
              [style.background]="accent(d)" (click)="trackDemoClick(d)">
              Request a Demo
            </a>
          </div>
          <div class="footer-brand">
            <span>Powered by</span><strong>Feebak</strong>
          </div>
        </div>
      </footer>
    </ng-container>
  `,
  styles: [`
    .loading-screen {
      min-height: 100vh; display: flex; align-items: center;
      justify-content: center; background: var(--fb-cream);
    }
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid var(--fb-border); border-top-color: var(--fb-navy);
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .not-found {
      min-height: 100vh; display: flex; align-items: center;
      justify-content: center; background: var(--fb-cream); padding: 24px;
    }
    .not-found-inner { text-align: center; }
    .nf-logo { font-size: 22px; font-weight: 800; color: var(--fb-navy); margin-bottom: 24px; }
    .not-found-inner h1 { font-size: 28px; font-weight: 800; color: var(--fb-navy); margin: 0 0 8px; }
    .not-found-inner p { color: var(--fb-text-muted); font-size: 15px; margin-bottom: 24px; }
    .back-link-btn {
      background: none; border: none; color: var(--fb-blue);
      font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit;
    }

    /* Header */
    .site-header {
      background: var(--fb-navy); position: sticky; top: 0; z-index: 100;
      box-shadow: 0 1px 0 rgba(255,255,255,0.08);
    }
    .header-inner {
      max-width: 860px; margin: 0 auto; padding: 0 24px;
      height: 60px; display: flex; align-items: center; justify-content: space-between;
    }
    .header-brand { display: flex; align-items: center; gap: 12px; }
    .brand-logo { font-size: 18px; font-weight: 800; color: #fff; }
    .brand-divider { width: 1px; height: 16px; background: rgba(255,255,255,0.25); }
    .brand-tagline { font-size: 13px; color: rgba(255,255,255,0.6); font-weight: 500; }
    .demo-btn {
      color: #fff; font-weight: 700; font-size: 13px;
      padding: 8px 16px; border-radius: 8px; text-decoration: none; transition: opacity 0.15s;
    }
    .demo-btn:hover { opacity: 0.88; text-decoration: none; }

    /* Breadcrumb */
    .breadcrumb-bar {
      background: #fff; border-bottom: 1px solid var(--fb-border);
    }
    .breadcrumb-inner {
      max-width: 860px; margin: 0 auto; padding: 12px 24px;
      display: flex; align-items: center; gap: 10px;
    }
    .back-btn {
      background: none; border: none; color: var(--fb-blue);
      font-size: 13.5px; font-weight: 700; cursor: pointer; font-family: inherit;
      padding: 0;
    }
    .back-btn:hover { text-decoration: underline; }
    .breadcrumb-sep { color: var(--fb-border); }
    .breadcrumb-name { font-size: 13.5px; color: var(--fb-text-muted); }

    /* Detail content */
    .detail-wrapper { background: var(--fb-cream); padding: 36px 24px 64px; }
    .detail-inner { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }

    /* Two-column layout */
    .two-col {
      display: grid;
      grid-template-columns: 3fr 2fr;
      gap: 20px;
      align-items: start;
    }
    .two-col > * { min-width: 0; }

    /* Idea section */
    .idea-section {
      background: #fff; border: 1px solid var(--fb-border);
      border-radius: 16px; padding: 28px 32px;
    }
    .idea-header {
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 10px; margin-bottom: 14px;
    }
    .idea-meta { display: flex; align-items: center; gap: 10px; }
    .kind-pill {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 11px; font-weight: 700; letter-spacing: 0.05em;
      padding: 3px 9px; border-radius: 999px; text-transform: uppercase;
    }
    .kind-pill[data-kind='post']    { background: #e6efff; color: #1a4ec0; }
    .kind-pill[data-kind='comment'] { background: #f0e6ff; color: #5e3aaa; }
    .kind-pill[data-kind='reply']   { background: #ffe9e9; color: #a83232; }
    .kind-pill[data-kind='vote']    { background: #e7f3ee; color: #1f6b3e; }
    .idea-date { font-size: 13px; color: var(--fb-text-muted); }
    .source-link { font-size: 13px; color: var(--fb-blue); font-weight: 600; }
    .source-link:hover { text-decoration: underline; }
    .idea-title {
      font-size: 22px; font-weight: 800; color: var(--fb-navy);
      margin: 0 0 12px; line-height: 1.3; letter-spacing: -0.3px;
    }
    .idea-body {
      font-size: 15px; color: #444; line-height: 1.65; margin: 0;
    }

    /* Community aside (right column) */
    .community-aside {
      background: #fff; border: 1px solid var(--fb-border);
      border-radius: 16px; padding: 16px;
      position: sticky; top: 80px; min-width: 0;
    }
    .community-aside .kind-pill {
      font-size: 9.5px; padding: 2px 6px;
    }
    .section-label {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: var(--fb-text-muted); margin: 0;
    }
    .community-header {
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 8px; margin-bottom: 16px;
    }
    .community-stats { display: flex; gap: 6px; flex-wrap: wrap; }
    .comm-stat {
      font-size: 12px; font-weight: 700; padding: 2px 8px;
      border-radius: 999px;
    }
    .comm-stat-vote    { background: #e7f3ee; color: #1f6b3e; }
    .comm-stat-comment { background: #f0e6ff; color: #5e3aaa; }
    .community-list { display: flex; flex-direction: column; gap: 8px; }
    .community-item {
      padding: 10px 12px; background: var(--fb-tint);
      border-radius: 8px; border: 1px solid var(--fb-border);
      display: flex; flex-direction: column; gap: 4px;
    }
    .community-item-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .related-date { font-size: 10.5px; color: var(--fb-text-muted); }
    .related-title {
      font-size: 12px; font-weight: 600; color: var(--fb-navy); margin: 0;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .related-body {
      font-size: 11.5px; color: var(--fb-text-muted); margin: 0; line-height: 1.45;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .no-comments { font-size: 12px; color: var(--fb-text-muted); margin: 0; text-align: center; padding: 12px 0; }
    .related-body.no-body { font-style: italic; }

    /* Answer section */
    .answer-section {
      background: #fff; border: 1px solid var(--fb-border);
      border-radius: 16px; padding: 28px 32px;
      border-left: 4px solid var(--accent, #F26B21);
    }
    .answer-header {
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 10px; margin-bottom: 18px;
    }
    .answer-badge {
      display: flex; align-items: center; gap: 8px;
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: var(--fb-navy);
    }
    .answer-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .product-badge {
      font-size: 12px; font-weight: 700; color: var(--fb-blue);
      background: #eef3ff; padding: 3px 10px; border-radius: 999px; text-decoration: none;
    }
    .product-badge:hover { text-decoration: underline; }
    .answer-body {
      font-size: 15px; color: #333; line-height: 1.7;
    }
    .answer-body :first-child { margin-top: 0; }
    .answer-body :last-child { margin-bottom: 0; }
    .rich-text * { max-width: 100% !important; box-sizing: border-box; }
    .rich-text img { height: auto !important; border-radius: 8px; margin: 8px 0; display: block; }
    .answer-section { overflow-x: hidden; }

    .answer-cta {
      margin-top: 24px; padding-top: 22px;
      border-top: 1px solid var(--fb-border);
      display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
    }
    .answer-cta p { margin: 0; font-size: 14px; color: var(--fb-text-muted); font-weight: 600; }
    .cta-btn {
      display: inline-block; color: #fff; font-weight: 700; font-size: 14px;
      padding: 10px 24px; border-radius: 8px; text-decoration: none; transition: opacity 0.15s;
    }
    .cta-btn:hover { opacity: 0.88; text-decoration: none; }

    /* Header customer name */
    .header-nav { display: flex; align-items: center; gap: 14px; }
    .header-customer { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.75); }

    /* Other ideas strip */
    .other-ideas-section { background: #fff; border-top: 1px solid var(--fb-border); padding: 40px 24px; }
    .other-ideas-inner { max-width: 860px; margin: 0 auto; }
    .other-ideas-head {
      display: flex; align-items: baseline; justify-content: space-between;
      gap: 16px; margin-bottom: 20px; flex-wrap: wrap;
    }
    .other-ideas-title { font-size: 17px; font-weight: 800; color: var(--fb-navy); margin: 0; }
    .view-all-btn {
      background: none; border: none; color: var(--fb-blue);
      font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; padding: 0;
    }
    .view-all-btn:hover { text-decoration: underline; }
    .other-ideas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 14px;
    }
    .other-idea-card {
      background: var(--fb-cream); border: 1px solid var(--fb-border);
      border-radius: 12px; padding: 16px 18px;
      cursor: pointer; display: flex; flex-direction: column; gap: 8px;
      transition: box-shadow 0.15s, transform 0.12s; outline: none;
    }
    .other-idea-card:hover, .other-idea-card:focus-visible {
      box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-2px);
    }
    .oi-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .oi-date { font-size: 11.5px; color: var(--fb-text-muted); }
    .oi-title { font-size: 13.5px; font-weight: 700; color: var(--fb-navy); margin: 0; line-height: 1.4; }
    .oi-cta { font-size: 12px; font-weight: 700; margin-top: auto; }

    /* Footer */
    .outro-section { background: var(--fb-navy); padding: 60px 24px; }
    .outro-inner { max-width: 760px; margin: 0 auto; text-align: center; }
    .outro-body { color: rgba(255,255,255,0.8); font-size: 15px; margin-bottom: 36px; }
    .cta-block h3 {
      font-size: 24px; font-weight: 800; color: #fff; margin: 0 0 20px;
    }
    .cta-btn-large {
      display: inline-block; color: #fff; font-weight: 700; font-size: 15px;
      padding: 14px 32px; border-radius: 10px; text-decoration: none;
      transition: opacity 0.15s, transform 0.1s;
    }
    .cta-btn-large:hover { opacity: 0.9; transform: translateY(-1px); text-decoration: none; }
    .footer-brand {
      margin-top: 48px; font-size: 12px; color: rgba(255,255,255,0.35);
      display: flex; align-items: center; justify-content: center; gap: 4px;
    }
    .footer-brand strong { color: rgba(255,255,255,0.55); }

    @media (max-width: 800px) {
      .two-col { grid-template-columns: 1fr; }
      .community-aside { position: static; }
    }
    @media (max-width: 600px) {
      .idea-section, .answer-section { padding: 20px 18px; }
      .idea-title { font-size: 18px; }
      .detail-wrapper { padding: 20px 14px 48px; }
    }
  `],
})
export class IdeaDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(PortalApi);
  private readonly tracker = inject(TrackerService);

  protected readonly detail = signal<PortalIdeaDetail | null>(null);
  protected readonly loading = signal(true);

  private token = '';
  private pageLoadedAt = 0;

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    const interactionId = this.route.snapshot.paramMap.get('id') ?? '';
    this.tracker.setToken(this.token);

    this.api.getIdeaDetail(this.token, interactionId).subscribe({
      next: (d) => {
        this.detail.set(d);
        this.loading.set(false);
        this.pageLoadedAt = Date.now();
        this.tracker.track('page_view', { page: 'idea_detail', interactionId }, interactionId);
      },
      error: () => {
        this.detail.set(null);
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.pageLoadedAt) {
      this.tracker.track('section_dwell', {
        section: 'idea_detail',
        dwellMs: this.tracker.elapsed(this.pageLoadedAt),
      });
    }
  }

  @HostListener('click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const anchor = (event.target as HTMLElement).closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (href?.startsWith('http') || href?.startsWith('//')) {
      this.tracker.track('outbound_click', { href });
    }
  }

  protected goBack(): void {
    void this.router.navigate(['/c', this.token]);
  }

  protected accent(d: PortalIdeaDetail): string {
    return d.page?.accentColor ?? '#F26B21';
  }

  protected kindLabel(kind: string): string { return KIND_LABEL[kind] ?? kind; }
  protected kindIcon(kind: string): string { return KIND_ICON[kind] ?? '📌'; }

  protected trackOutbound(href: string): void {
    this.tracker.track('outbound_click', { href });
  }

  protected trackDemoClick(d: PortalIdeaDetail): void {
    this.tracker.track('demo_request', { calendlyUrl: d.page?.calendlyUrl });
  }

  protected openOtherIdea(it: PortalOtherIdea): void {
    this.tracker.track('navigation', { to: 'idea_detail', interactionId: it.id }, it.id);
    void this.router.navigate(['/c', this.token, 'idea', it.id]);
  }
}
