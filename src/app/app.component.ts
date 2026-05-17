import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ClarityService } from './clarity.service';

@Component({
  selector: 'fb-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent implements OnInit {
  private clarity = inject(ClarityService);

  ngOnInit(): void {
    this.clarity.init();
  }
}