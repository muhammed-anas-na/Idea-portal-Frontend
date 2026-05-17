import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PortalApi, PortalData, PortalInteraction, PortalUseCase } from '../core/portal.api';
import { TrackerService } from '../core/tracker.service';

const KIND_LABEL: Record<string, string> = {
  post: 'Idea', comment: 'Comment', reply: 'Reply', vote: 'Vote',
};
const KIND_ICON: Record<string, string> = {
  post: '💡', comment: '💬', reply: '↩️', vote: '👍',
};

type ListingTab = 'ideas' | 'cases';

@Component({
  selector: 'fb-customer-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Loading -->
    <div class="loading-screen" *ngIf="loading()">
      <div class="spinner"></div>
    </div>

    <!-- Not found -->
    <div class="not-found" *ngIf="!loading() && !data()">
      <div class="not-found-inner">
        <div class="nf-logo">Feebak</div>
        <h1>Page not found</h1>
        <p>This link may have expired or the page hasn't been published yet.</p>
      </div>
    </div>

    <ng-container *ngIf="data() as d">
      <!-- Header -->
      <header class="site-header">
        <div class="header-inner">
          <div class="header-brand">
            <span class="brand-logo">Feebak</span>
            <span class="brand-divider"></span>
            <span class="brand-tagline">Ideas Portal</span>
          </div>
          <nav class="header-nav">
            <span class="header-customer">{{ d.name }}</span>
            <a *ngIf="d.page?.calendlyUrl" class="demo-btn"
              [href]="d.page!.calendlyUrl!" target="_blank" rel="noopener"
              [style.background]="accent(d)" (click)="trackDemoClick(d)">
              Request a Demo
            </a>
          </nav>
        </div>
      </header>

      <!-- Hero -->
      <div class="hero">
        <div class="hero-inner">
          <h1 class="hero-title">
            Hi <span class="hero-name" [style.color]="accent(d)">{{ d.name }}</span>,<br />
            here's how Feebak addresses your ideas.
          </h1>
          <div *ngIf="d.page?.introHtml" class="hero-intro rich-text"
            [innerHTML]="d.page!.introHtml"></div>
        </div>
      </div>

      <!-- Tabs + content -->
      <main class="feed-wrapper">
        <div class="feed-inner">

          <!-- Tab row -->
          <div class="tab-row" *ngIf="d.useCases.length > 0">
            <button class="tab-btn" [class.active]="activeTab() === 'ideas'" (click)="activeTab.set('ideas')">
              Ideas
              <span class="tab-count">{{ d.interactions.length }}</span>
            </button>
            <button class="tab-btn" [class.active]="activeTab() === 'cases'" (click)="activeTab.set('cases')">
              Use Cases
              <span class="tab-count">{{ d.useCases.length }}</span>
            </button>
          </div>

          <!-- IDEAS tab -->
          <div *ngIf="activeTab() === 'ideas'">
            <div class="feed-heading">
              <h2>{{ d.interactions.length }} idea{{ d.interactions.length !== 1 ? 's' : '' }} addressed</h2>
              <p class="feed-sub">Click any card to see how Feebak responds to your feedback.</p>
            </div>

            <div class="cards-grid">
              <article
                *ngFor="let it of d.interactions; trackBy: trackById"
                class="idea-card"
                (click)="openDetail(it)"
                (keydown.enter)="openDetail(it)"
                tabindex="0"
                role="button"
              >
                <div class="card-body">
                  <div class="card-meta">
                    <span class="kind-pill" [attr.data-kind]="it.kind">
                      {{ kindIcon(it.kind) }} {{ kindLabel(it.kind) }}
                    </span>
                    <span *ngIf="it.occurredOn" class="card-date">
                      {{ it.occurredOn | date:'MMM d, y' }}
                    </span>
                  </div>
                  <h3 class="card-title">{{ it.title }}</h3>
                  <p *ngIf="it.body" class="card-excerpt">{{ it.body }}</p>
                  <div class="card-stats" *ngIf="it.voteCount || it.commentCount">
                    <span *ngIf="it.voteCount" class="stat-badge stat-vote">👍 {{ it.voteCount }}</span>
                    <span *ngIf="it.commentCount" class="stat-badge stat-comment">💬 {{ it.commentCount }}</span>
                  </div>
                </div>
                <div class="card-cta" [style.background]="accent(d)">
                  <span>See how Feebak solves this</span>
                  <span class="cta-arrow">→</span>
                </div>
              </article>
            </div>

            <div class="empty-feed" *ngIf="d.interactions.length === 0">
              <p>No published answers yet. Check back soon!</p>
            </div>
          </div>

          <!-- USE CASES tab -->
          <div *ngIf="activeTab() === 'cases'">
            <div class="feed-heading">
              <h2>{{ d.useCases.length }} use case{{ d.useCases.length !== 1 ? 's' : '' }}</h2>
              <p class="feed-sub">See how Feebak solves real-world challenges.</p>
            </div>

            <div class="cards-grid">
              <article
                *ngFor="let uc of d.useCases"
                class="idea-card"
                (click)="openCase(uc)"
                (keydown.enter)="openCase(uc)"
                tabindex="0"
                role="button"
              >
                <div class="card-body">
                  <div class="card-meta">
                    <span class="kind-pill kind-pill-case">📋 Use Case</span>
                    <span *ngIf="uc.product" class="card-date">{{ uc.product.name }}</span>
                  </div>
                  <h3 class="card-title">{{ uc.title }}</h3>
                  <p *ngIf="uc.summary" class="card-excerpt">{{ uc.summary }}</p>
                </div>
                <div class="card-cta" [style.background]="accent(d)">
                  <span>Read use case</span>
                  <span class="cta-arrow">→</span>
                </div>
              </article>
            </div>
          </div>

        </div>
      </main>

      <!-- Footer / Outro -->
      <footer class="outro-section">
        <div class="outro-inner">
          <div *ngIf="d.page?.outroHtml" class="outro-body rich-text"
            [innerHTML]="d.page!.outroHtml"></div>
          <div class="cta-block" *ngIf="d.page?.calendlyUrl">
            <h3>Ready to see Feebak in action?</h3>
            <a class="cta-btn" [href]="d.page!.calendlyUrl!" target="_blank" rel="noopener"
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
    .not-found-inner p { color: var(--fb-text-muted); font-size: 15px; }

    /* Header */
    .site-header {
      background: var(--fb-navy); position: sticky; top: 0; z-index: 100;
      box-shadow: 0 1px 0 rgba(255,255,255,0.08);
    }
    .header-inner {
      max-width: 1040px; margin: 0 auto; padding: 0 24px;
      height: 60px; display: flex; align-items: center; justify-content: space-between;
    }
    .header-brand { display: flex; align-items: center; gap: 12px; }
    .brand-logo { font-size: 18px; font-weight: 800; color: #fff; letter-spacing: -0.3px; }
    .brand-divider { width: 1px; height: 16px; background: rgba(255,255,255,0.25); }
    .brand-tagline { font-size: 13px; color: rgba(255,255,255,0.6); font-weight: 500; }
    .header-nav { display: flex; align-items: center; gap: 14px; }
    .header-customer {
      font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.75);
    }
    .demo-btn {
      color: #fff; font-weight: 700; font-size: 13px;
      padding: 8px 16px; border-radius: 8px; text-decoration: none; transition: opacity 0.15s;
    }
    .demo-btn:hover { opacity: 0.88; text-decoration: none; }

    /* Hero */
    .hero { background: var(--fb-navy); padding: 52px 24px 60px; }
    .hero-inner { max-width: 1040px; margin: 0 auto; }
    .hero-title {
      font-size: 36px; font-weight: 800; color: #fff;
      line-height: 1.2; margin: 0 0 16px; letter-spacing: -0.5px;
    }
    .hero-name { font-weight: 800; }
    .hero-intro { color: rgba(255,255,255,0.72); font-size: 15px; max-width: 560px; }

    /* Feed */
    .feed-wrapper { background: var(--fb-cream); padding: 44px 24px 64px; }
    .feed-inner { max-width: 1040px; margin: 0 auto; }

    /* Tabs */
    .tab-row {
      display: flex; gap: 4px; border-bottom: 2px solid var(--fb-border);
      margin-bottom: 28px;
    }
    .tab-btn {
      background: transparent; border: none; border-bottom: 2px solid transparent;
      margin-bottom: -2px; padding: 10px 18px;
      font-size: 14px; font-weight: 700; color: var(--fb-text-muted);
      cursor: pointer; font-family: inherit;
      display: flex; align-items: center; gap: 7px;
      transition: color 0.15s;
    }
    .tab-btn:hover { color: var(--fb-navy); }
    .tab-btn.active { color: var(--fb-navy); border-bottom-color: var(--fb-navy); }
    .tab-count {
      background: var(--fb-border); color: var(--fb-text-muted);
      font-size: 11px; font-weight: 700;
      padding: 1px 7px; border-radius: 999px;
    }
    .tab-btn.active .tab-count { background: var(--fb-navy); color: #fff; }

    .feed-heading { margin-bottom: 28px; }
    .feed-heading h2 {
      font-size: 22px; font-weight: 800; color: var(--fb-navy); margin: 0 0 4px;
    }
    .feed-sub { color: var(--fb-text-muted); font-size: 14px; margin: 0; }

    /* Cards grid */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    /* Idea card */
    .idea-card {
      background: #fff; border: 1px solid var(--fb-border); border-radius: 14px;
      overflow: hidden; cursor: pointer; display: flex; flex-direction: column;
      transition: box-shadow 0.18s, transform 0.15s; outline: none;
    }
    .idea-card:hover, .idea-card:focus-visible {
      box-shadow: 0 8px 28px rgba(0,0,0,0.10); transform: translateY(-2px);
    }
    .card-body { padding: 20px 20px 16px; flex: 1; }
    .card-meta {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 10px; flex-wrap: wrap;
    }
    .kind-pill {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 11px; font-weight: 700; letter-spacing: 0.05em;
      padding: 3px 9px; border-radius: 999px; text-transform: uppercase;
    }
    .kind-pill[data-kind='post']    { background: #e6efff; color: #1a4ec0; }
    .kind-pill[data-kind='comment'] { background: #f0e6ff; color: #5e3aaa; }
    .kind-pill[data-kind='reply']   { background: #ffe9e9; color: #a83232; }
    .kind-pill[data-kind='vote']    { background: #e7f3ee; color: #1f6b3e; }
    .kind-pill-case { background: #fff4e0; color: #8a5a00; }
    .card-date { font-size: 12px; color: var(--fb-text-muted); }
    .card-title {
      font-size: 15px; font-weight: 700; color: var(--fb-navy);
      margin: 0 0 8px; line-height: 1.4;
    }
    .card-excerpt {
      font-size: 13.5px; color: var(--fb-text-muted); margin: 0; line-height: 1.55;
      display: -webkit-box; -webkit-line-clamp: 3;
      -webkit-box-orient: vertical; overflow: hidden;
    }
    .card-stats { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
    .stat-badge {
      font-size: 11.5px; font-weight: 700; padding: 2px 8px;
      border-radius: 999px;
    }
    .stat-vote    { background: #e7f3ee; color: #1f6b3e; }
    .stat-comment { background: #f0e6ff; color: #5e3aaa; }

    .card-cta {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 20px; color: #fff; font-size: 13px; font-weight: 700;
      margin-top: auto;
    }
    .cta-arrow { font-size: 16px; transition: transform 0.15s; }
    .idea-card:hover .cta-arrow { transform: translateX(4px); }
    .empty-feed { text-align: center; padding: 60px 0; color: var(--fb-text-muted); font-size: 15px; }

    /* Footer */
    .outro-section { background: var(--fb-navy); padding: 60px 24px; }
    .outro-inner { max-width: 760px; margin: 0 auto; text-align: center; }
    .outro-body { color: rgba(255,255,255,0.8); font-size: 15px; margin-bottom: 36px; }
    .rich-text :first-child { margin-top: 0; }
    .cta-block h3 {
      font-size: 24px; font-weight: 800; color: #fff; margin: 0 0 20px; letter-spacing: -0.3px;
    }
    .cta-btn {
      display: inline-block; color: #fff; font-weight: 700; font-size: 15px;
      padding: 14px 32px; border-radius: 10px; text-decoration: none;
      transition: opacity 0.15s, transform 0.1s;
    }
    .cta-btn:hover { opacity: 0.9; transform: translateY(-1px); text-decoration: none; }
    .footer-brand {
      margin-top: 48px; font-size: 12px; color: rgba(255,255,255,0.35);
      display: flex; align-items: center; justify-content: center; gap: 4px;
    }
    .footer-brand strong { color: rgba(255,255,255,0.55); }

    @media (max-width: 600px) {
      .hero { padding: 32px 18px 40px; }
      .hero-title { font-size: 26px; }
      .feed-wrapper { padding: 28px 16px 48px; }
      .cards-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class CustomerPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(PortalApi);
  private readonly tracker = inject(TrackerService);

  protected readonly data = signal<PortalData | null>(null);
  protected readonly loading = signal(true);
  protected readonly activeTab = signal<ListingTab>('ideas');

  private token = '';
  private pageLoadedAt = 0;

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    this.tracker.setToken(this.token);

    this.api.getByToken(this.token).subscribe({
      next: (d) => {
        // If link targets a specific idea, redirect directly there
        if (d.targetInteractionId) {
          void this.router.navigate(['/c', this.token, 'idea', d.targetInteractionId], {
            replaceUrl: true,
          });
          return;
        }
        this.data.set(d);
        this.loading.set(false);
        this.pageLoadedAt = Date.now();
        this.tracker.track('page_view', { token: this.token, customerName: d.name });
      },
      error: () => {
        this.data.set(null);
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.pageLoadedAt) {
      this.tracker.track('section_dwell', {
        section: 'listing',
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

  protected openDetail(it: PortalInteraction): void {
    this.tracker.track('navigation', { to: 'idea_detail', interactionId: it.id }, it.id);
    void this.router.navigate(['/c', this.token, 'idea', it.id]);
  }

  protected openCase(uc: PortalUseCase): void {
    this.tracker.track('navigation', { to: 'use_case', useCaseId: uc.id });
    void this.router.navigate(['/c', this.token, 'case', uc.id]);
  }

  protected accent(d: PortalData): string {
    return d.page?.accentColor ?? '#F26B21';
  }

  protected kindLabel(kind: string): string { return KIND_LABEL[kind] ?? kind; }
  protected kindIcon(kind: string): string { return KIND_ICON[kind] ?? '📌'; }
  protected trackById(_: number, it: PortalInteraction): string { return it.id; }

  protected trackDemoClick(d: PortalData): void {
    this.tracker.track('demo_request', { calendlyUrl: d.page?.calendlyUrl });
  }
}
