import { provideHttpClient } from "@angular/common/http";
import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideStoreDevtools } from "@ngrx/store-devtools";

import { appRoutes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideStoreDevtools({
      maxAge: 25,
      connectInZone: true,
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(),
  ],
};
