import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <main class="page">
      <!-- Top nav -->
      <header class="nav">
        <div class="nav-inner">
 <a class="brand" href="/">
  <img src="/loop-logo.png" alt="Feebak Ideas" class="brand-logo" />
</a>
          <nav class="nav-links">
            <a href="#how-it-works">How it works</a>
            <a href="#ideas">Ideas</a>
            <a href="#contact">Talk to us</a>
            <button class="btn btn-primary btn-sm" (click)="onGetStarted()">
              Book a demo
            </button>
          </nav>
        </div>
      </header>

      <!-- Hero -->
      <section class="hero">
        <div class="hero-inner">
          <span class="eyebrow">Genesys Qustions · answered by Feebak</span>
          <h1 class="hero-title">
            Your Questions from the Genesys portal,
            <span class="accent">solved.</span>
          </h1>
          <p class="hero-sub">
            We've been listening. For every idea, vote, and comment you've
            shared on the Genesys Product Ideas Lab, Feebak has a clear answer:
            <strong>here's how we'd solve it for you</strong> — today, not
            someday.
          </p>
          <div class="hero-cta">
            <button class="btn btn-primary" (click)="onGetStarted()">
              See your answers
            </button>
            <button class="btn btn-ghost" (click)="scrollTo('how-it-works')">
              How it works →
            </button>
          </div>
          <div class="hero-meta">
            <div class="meta-item">
              <span class="meta-num">100+</span>
              <span class="meta-label">Genesys ideas mapped</span>
            </div>
            <div class="meta-divider"></div>
            <div class="meta-item">
              <span class="meta-num">1:1</span>
              <span class="meta-label">Personalized to you</span>
            </div>
            <div class="meta-divider"></div>
            <div class="meta-item">
              <span class="meta-num">Days</span>
              <span class="meta-label">Not quarters</span>
            </div>
          </div>
        </div>
        <div class="hero-glow"></div>
      </section>

      <!-- How it works -->
      <section id="how-it-works" class="section">
        <div class="section-inner">
          <span class="eyebrow center">How it works</span>
          <h2 class="section-title">From your idea to a working answer</h2>
          <div class="steps">
            <div class="step-card">
              <span class="step-num">01</span>
              <h3>You shared an idea</h3>
              <p>
                You voted, commented, or posted on the Genesys Product Ideas
                Lab — telling Genesys what your team needs.
              </p>
            </div>
            <div class="step-card">
              <span class="step-num">02</span>
              <h3>We mapped it</h3>
              <p>
                Our team paired each relevant idea with a clear, practical
                answer: how Feebak addresses exactly what you raised.
              </p>
            </div>
            <div class="step-card">
              <span class="step-num">03</span>
              <h3>You get a tailored view</h3>
              <p>
                Open your personal page, see your ideas alongside our answers,
                and decide what you'd like to explore further.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Preview card -->
      <section id="ideas" class="section section-tint">
        <div class="section-inner two-col">
          <div>
            <span class="eyebrow">A glimpse inside</span>
            <h2 class="section-title left">
              Every idea, with a real answer beside it.
            </h2>
            <p class="section-body">
              No more generic landing pages. Each idea you've engaged with
              comes with a "How Feebak solves this" note from our team —
              written for your context, not a brochure.
            </p>
            <button class="btn btn-primary" (click)="onGetStarted()">
              Open your portal
            </button>
          </div>
          <div class="preview-card">
            <div class="preview-tag">Your idea</div>
            <h4>Smarter routing for after-hours calls</h4>
            <p class="preview-quote">
              "We need a way to triage out-of-hours volume without spinning up
              a second team."
            </p>
            <div class="preview-divider">
              <span>How Feebak solves this</span>
            </div>
            <p class="preview-answer">
              Feebak's intent-aware deflection routes after-hours contacts to
              self-serve flows, escalating only the ones that genuinely need a
              human — typically reducing overnight queue volume by 40–60%.
            </p>
            <button class="link-btn" (click)="onGetStarted()">
              See full answer →
            </button>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section id="contact" class="cta-band">
        <div class="cta-inner">
          <h2>Ready to see your answers?</h2>
          <p>Open the page we built for you, or talk to the team behind it.</p>
          <div class="cta-buttons">
            <button class="btn btn-primary" (click)="onGetStarted()">
              See your answers
            </button>
            <button class="btn btn-outline" (click)="onGetStarted()">
              Book a 20-min chat
            </button>
          </div>
        </div>
      </section>

      <footer class="footer">
        <div class="footer-inner">
          <span>© {{ year }} Feebak. Built for Genesys customers.</span>
          <span class="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Contact</a>
          </span>
        </div>
      </footer>
    </main>
  `,
  styles: [`
    :host {
      --bg: #ffffff;
      --bg-tint: #fdf6f3;
      --ink: #0b1f3a;
      --ink-soft: #4a5a72;
      --muted: #7a8699;
      --accent: #ff5a4e;
      --accent-soft: #ffe9e5;
      --accent-deep: #e63f33;
      --border: #ecebe7;
      --shadow: 0 10px 40px rgba(11, 31, 58, 0.06);
      --radius: 14px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
        sans-serif;
      color: var(--ink);
      display: block;
    }

    * { box-sizing: border-box; }
.brand-logo {
  height: 60px;       /* adjust to match your navbar height */
  width: auto;
  display: block;
}
    .page {
      background: var(--bg);
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* Nav */
    .nav {
      position: sticky;
      top: 0;
      z-index: 10;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: saturate(180%) blur(12px);
      border-bottom: 1px solid var(--border);
    }
    .nav-inner {
      max-width: 1180px;
      margin: 0 auto;
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: var(--ink);
      font-weight: 600;
    }
    .brand-mark {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: var(--accent);
      color: #fff;
      display: grid;
      place-items: center;
      font-weight: 700;
      font-size: 1rem;
    }
    .brand-name { font-size: 1.05rem; }
    .brand-divider { color: var(--muted); }
    .brand-sub { color: var(--ink-soft); font-weight: 500; }
    .nav-links {
      display: flex;
      gap: 1.75rem;
      align-items: center;
    }
    .nav-links a {
      color: var(--ink-soft);
      text-decoration: none;
      font-size: 0.95rem;
      transition: color 0.15s;
    }
    .nav-links a:hover { color: var(--ink); }

    /* Hero */
    .hero {
      position: relative;
      padding: 6rem 1.5rem 5rem;
      overflow: hidden;
    }
    .hero-inner {
      max-width: 880px;
      margin: 0 auto;
      text-align: center;
      position: relative;
      z-index: 1;
    }
    .eyebrow {
      display: inline-block;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--accent-deep);
      background: var(--accent-soft);
      padding: 0.4rem 0.8rem;
      border-radius: 999px;
      margin-bottom: 1.5rem;
    }
    .eyebrow.center { display: inline-block; }
    .hero-title {
      font-size: clamp(2.2rem, 5vw, 3.6rem);
      line-height: 1.08;
      letter-spacing: -0.02em;
      margin: 0 0 1.25rem;
      font-weight: 700;
    }
    .accent { color: var(--accent); }
    .hero-sub {
      font-size: 1.15rem;
      color: var(--ink-soft);
      line-height: 1.6;
      max-width: 640px;
      margin: 0 auto 2rem;
    }
    .hero-sub strong { color: var(--ink); font-weight: 600; }
    .hero-cta {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 3rem;
    }
    .hero-meta {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
    }
    .meta-item { text-align: center; }
    .meta-num {
      display: block;
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--ink);
    }
    .meta-label {
      display: block;
      font-size: 0.85rem;
      color: var(--muted);
      margin-top: 0.2rem;
    }
    .meta-divider {
      width: 1px;
      height: 32px;
      background: var(--border);
    }
    .hero-glow {
      position: absolute;
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      width: 700px;
      height: 700px;
      background: radial-gradient(
        circle,
        rgba(255, 90, 78, 0.12) 0%,
        transparent 60%
      );
      pointer-events: none;
    }

    /* Buttons */
    .btn {
      font-family: inherit;
      font-size: 0.95rem;
      font-weight: 600;
      padding: 0.85rem 1.5rem;
      border-radius: 10px;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.18s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .btn-sm { padding: 0.55rem 1rem; font-size: 0.9rem; }
    .btn-primary {
      background: var(--accent);
      color: #fff;
      box-shadow: 0 6px 20px rgba(255, 90, 78, 0.3);
    }
    .btn-primary:hover {
      background: var(--accent-deep);
      transform: translateY(-1px);
      box-shadow: 0 10px 24px rgba(255, 90, 78, 0.35);
    }
    .btn-ghost {
      background: transparent;
      color: var(--ink);
      border-color: var(--border);
    }
    .btn-ghost:hover { background: #f7f6f3; }
    .btn-outline {
      background: transparent;
      color: #fff;
      border-color: rgba(255, 255, 255, 0.4);
    }
    .btn-outline:hover { background: rgba(255, 255, 255, 0.1); }

    /* Sections */
    .section { padding: 5rem 1.5rem; }
    .section-tint { background: var(--bg-tint); }
    .section-inner {
      max-width: 1100px;
      margin: 0 auto;
    }
    .section-title {
      font-size: clamp(1.8rem, 3.5vw, 2.4rem);
      line-height: 1.2;
      letter-spacing: -0.015em;
      text-align: center;
      margin: 1rem 0 3rem;
      font-weight: 700;
    }
    .section-title.left { text-align: left; margin-bottom: 1.25rem; }
    .section-body {
      color: var(--ink-soft);
      font-size: 1.05rem;
      line-height: 1.65;
      margin-bottom: 1.75rem;
    }

    /* Steps */
    .steps {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
    }
    .step-card {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 2rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .step-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow);
    }
    .step-num {
      display: inline-block;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--accent);
      margin-bottom: 1rem;
      letter-spacing: 0.05em;
    }
    .step-card h3 {
      font-size: 1.15rem;
      margin: 0 0 0.6rem;
      font-weight: 600;
    }
    .step-card p {
      color: var(--ink-soft);
      font-size: 0.95rem;
      line-height: 1.6;
      margin: 0;
    }

    /* Two col */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }
    .preview-card {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 2rem;
      box-shadow: var(--shadow);
    }
    .preview-tag {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--ink-soft);
      background: #f1eee9;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      margin-bottom: 0.85rem;
    }
    .preview-card h4 {
      font-size: 1.15rem;
      margin: 0 0 0.6rem;
      font-weight: 600;
    }
    .preview-quote {
      color: var(--ink-soft);
      font-style: italic;
      margin: 0 0 1.5rem;
      font-size: 0.95rem;
      line-height: 1.55;
    }
    .preview-divider {
      position: relative;
      text-align: center;
      margin: 1.5rem 0;
    }
    .preview-divider::before,
    .preview-divider::after {
      content: '';
      position: absolute;
      top: 50%;
      width: calc(50% - 90px);
      height: 1px;
      background: var(--border);
    }
    .preview-divider::before { left: 0; }
    .preview-divider::after { right: 0; }
    .preview-divider span {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--accent);
    }
    .preview-answer {
      color: var(--ink);
      font-size: 0.95rem;
      line-height: 1.6;
      margin: 0 0 1.25rem;
    }
    .link-btn {
      background: none;
      border: none;
      color: var(--accent);
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      padding: 0;
      font-family: inherit;
    }
    .link-btn:hover { color: var(--accent-deep); }

    /* CTA band */
    .cta-band {
      background: var(--ink);
      color: #fff;
      padding: 5rem 1.5rem;
      position: relative;
      overflow: hidden;
    }
    .cta-band::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 600px;
      height: 600px;
      background: radial-gradient(
        circle,
        rgba(255, 90, 78, 0.18) 0%,
        transparent 60%
      );
      transform: translate(-50%, -50%);
    }
    .cta-inner {
      max-width: 720px;
      margin: 0 auto;
      text-align: center;
      position: relative;
      z-index: 1;
    }
    .cta-band h2 {
      font-size: clamp(1.8rem, 3.5vw, 2.4rem);
      margin: 0 0 0.75rem;
      font-weight: 700;
      letter-spacing: -0.015em;
    }
    .cta-band p {
      color: rgba(255, 255, 255, 0.75);
      font-size: 1.1rem;
      margin: 0 0 2rem;
    }
    .cta-buttons {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* Footer */
    .footer {
      border-top: 1px solid var(--border);
      padding: 1.5rem;
    }
    .footer-inner {
      max-width: 1180px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      color: var(--muted);
      font-size: 0.9rem;
    }
    .footer-links { display: flex; gap: 1.5rem; }
    .footer-links a {
      color: var(--muted);
      text-decoration: none;
    }
    .footer-links a:hover { color: var(--ink); }

    /* Responsive */
    @media (max-width: 860px) {
      .nav-links a:not(.btn) { display: none; }
      .steps { grid-template-columns: 1fr; }
      .two-col { grid-template-columns: 1fr; gap: 2.5rem; }
      .hero { padding: 4rem 1.5rem 3rem; }
    }
  `],
})
export class HomeComponent {
  private router = inject(Router);
  year = new Date().getFullYear();

  onGetStarted(): void {
    // Route to wherever the recipient's personal page lives
    // e.g., this.router.navigate(['/ideas']);
    console.log('Get Started clicked');
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}