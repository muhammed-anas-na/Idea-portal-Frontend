import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import Clarity from '@microsoft/clarity';

@Injectable({ providedIn: 'root' })
export class ClarityService {
  init(): void {
    if (environment.clarityProjectId) {
    Clarity.init(environment.clarityProjectId);
  }

    (function(c: any, l: Document, a: string, r: string, i: string) {
      c[a] = c[a] || function() { (c[a].q = c[a].q || []).push(arguments); };
      const t = l.createElement(r) as HTMLScriptElement;
      t.async = true;
      t.src = 'https://www.clarity.ms/tag/' + i;
      const y = l.getElementsByTagName(r)[0];
      y.parentNode!.insertBefore(t, y);
    })(window, document, 'clarity', 'script', environment.clarityProjectId);
  }
}