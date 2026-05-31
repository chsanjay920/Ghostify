import { RenderMode, ServerRoute } from '@angular/ssr';

// Use Server render mode for dynamic routes with parameters (avoid prerendering)
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
