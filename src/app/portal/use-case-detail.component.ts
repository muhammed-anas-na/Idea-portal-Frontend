import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PortalApi, PortalCaseDetail } from '../core/portal.api';
import { TrackerService } from '../core/tracker.service';

@Component({
  selector: 'fb-use-case-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-screen" *ngIf="loading()">
      <div class="spinner"></div>
    </div>

    <div class="not-found" *ngIf="!loading() && !detail()">
      <div class="not-found-inner">
        <div class="nf-logo">Feebak</div>
        <h1>Use case not found</h1>
        <p>This page may have been removed or is not yet published.</p>
        <button class="back-link-btn" (click)="goBack()">← Back to portal</button>
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

      <!-- Breadcrumb -->
      <div class="breadcrumb-bar">
        <div class="breadcrumb-inner">
          <button class="back-btn" (click)="goBack()">← Back to portal</button>
          <span class="breadcrumb-sep">·</span>
          <span class="breadcrumb-name">Use Cases</span>
        </div>
      </div>

      <main class="detail-wrapper">
        <div class="detail-inner">

          <!-- Use Case card -->
          <section class="case-section">
            <div class="case-header">
              <div class="case-meta">
                <span class="case-pill">📋 Use Case</span>
                <span *ngIf="d.useCase.product" class="case-product">{{ d.useCase.product.name }}</span>
              </div>
              <a *ngIf="d.useCase.product" class="product-badge"
                [href]="d.useCase.product.url" target="_blank" rel="noopener"
                (click)="trackOutbound(d.useCase.product!.url)">
                {{ d.useCase.product.name }} ↗
              </a>
            </div>
            <h1 class="case-title">{{ d.useCase.title }}</h1>
            <p *ngIf="d.useCase.summary" class="case-summary">{{ d.useCase.summary }}</p>
          </section>

          <!-- Content -->
          <section class="content-section" [style.--accent]="accent(d)">
            <div class="content-body rich-text" [innerHTML]="d.useCase.contentHtml"></div>

            <!-- Inline CTA -->
            <div class="content-cta" *ngIf="d.page?.calendlyUrl">
              <p>Want to learn more?</p>
              <a class="cta-btn" [href]="d.page!.calendlyUrl!" target="_blank" rel="noopener"
                [style.background]="accent(d)" (click)="trackDemoClick(d)">
                Book a Demo
              </a>
            </div>
          </section>

        </div>
      </main>

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
    .header-nav { display: flex; align-items: center; gap: 14px; }
    .header-customer { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.75); }
    .demo-btn {
      color: #fff; font-weight: 700; font-size: 13px;
      padding: 8px 16px; border-radius: 8px; text-decoration: none; transition: opacity 0.15s;
    }
    .demo-btn:hover { opacity: 0.88; text-decoration: none; }

    /* Breadcrumb */
    .breadcrumb-bar { background: #fff; border-bottom: 1px solid var(--fb-border); }
    .breadcrumb-inner {
      max-width: 860px; margin: 0 auto; padding: 12px 24px;
      display: flex; align-items: center; gap: 10px;
    }
    .back-btn {
      background: none; border: none; color: var(--fb-blue);
      font-size: 13.5px; font-weight: 700; cursor: pointer; font-family: inherit; padding: 0;
    }
    .back-btn:hover { text-decoration: underline; }
    .breadcrumb-sep { color: var(--fb-border); }
    .breadcrumb-name { font-size: 13.5px; color: var(--fb-text-muted); }

    /* Detail content */
    .detail-wrapper { background: var(--fb-cream); padding: 36px 24px 64px; }
    .detail-inner { max-width: 860px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }

    /* Use case card */
    .case-section {
      background: #fff; border: 1px solid var(--fb-border);
      border-radius: 16px; padding: 28px 32px;
    }
    .case-header {
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 10px; margin-bottom: 14px;
    }
    .case-meta { display: flex; align-items: center; gap: 10px; }
    .case-pill {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 11px; font-weight: 700; letter-spacing: 0.05em;
      padding: 3px 9px; border-radius: 999px; text-transform: uppercase;
      background: #fff4e0; color: #8a5a00;
    }
    .case-product { font-size: 13px; color: var(--fb-text-muted); }
    .product-badge {
      font-size: 12px; font-weight: 700; color: var(--fb-blue);
      background: #eef3ff; padding: 3px 10px; border-radius: 999px; text-decoration: none;
    }
    .product-badge:hover { text-decoration: underline; }
    .case-title {
      font-size: 22px; font-weight: 800; color: var(--fb-navy);
      margin: 0 0 12px; line-height: 1.3; letter-spacing: -0.3px;
    }
    .case-summary { font-size: 15px; color: #555; line-height: 1.65; margin: 0; }

    /* Content section */
    .content-section {
      background: #fff; border: 1px solid var(--fb-border);
      border-radius: 16px; padding: 28px 32px;
      border-left: 4px solid var(--accent, #F26B21);
    }
    .content-body {
      font-size: 15px; color: #333; line-height: 1.7;
    }
    .content-body :first-child { margin-top: 0; }
    .content-body :last-child { margin-bottom: 0; }
    .rich-text img { max-width: 100%; border-radius: 8px; margin: 8px 0; }
    .content-cta {
      margin-top: 24px; padding-top: 22px; border-top: 1px solid var(--fb-border);
      display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
    }
    .content-cta p { margin: 0; font-size: 14px; color: var(--fb-text-muted); font-weight: 600; }
    .cta-btn {
      display: inline-block; color: #fff; font-weight: 700; font-size: 14px;
      padding: 10px 24px; border-radius: 8px; text-decoration: none; transition: opacity 0.15s;
    }
    .cta-btn:hover { opacity: 0.88; text-decoration: none; }

    /* Footer */
    .outro-section { background: var(--fb-navy); padding: 60px 24px; }
    .outro-inner { max-width: 760px; margin: 0 auto; text-align: center; }
    .outro-body { color: rgba(255,255,255,0.8); font-size: 15px; margin-bottom: 36px; }
    .cta-block h3 { font-size: 24px; font-weight: 800; color: #fff; margin: 0 0 20px; }
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

    @media (max-width: 600px) {
      .case-section, .content-section { padding: 20px 18px; }
      .case-title { font-size: 18px; }
      .detail-wrapper { padding: 20px 14px 48px; }
    }
  `],
})
export class UseCaseDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(PortalApi);
  private readonly tracker = inject(TrackerService);

  protected readonly detail = signal<PortalCaseDetail | null>(null);
  protected readonly loading = signal(true);

  private token = '';
  private pageLoadedAt = 0;

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    const useCaseId = this.route.snapshot.paramMap.get('useCaseId') ?? '';
    this.tracker.setToken(this.token);

    this.api.getCaseDetail(this.token, useCaseId).subscribe({
      next: (d) => {
        this.detail.set(d);
        this.loading.set(false);
        this.pageLoadedAt = Date.now();
        this.tracker.track('page_view', { page: 'use_case', useCaseId }, undefined);
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
        section: 'use_case',
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

  protected accent(d: PortalCaseDetail): string {
    return d.page?.accentColor ?? '#F26B21';
  }

  protected trackOutbound(href: string): void {
    this.tracker.track('outbound_click', { href });
  }

  protected trackDemoClick(d: PortalCaseDetail): void {
    this.tracker.track('demo_request', { calendlyUrl: d.page?.calendlyUrl });
  }
}
