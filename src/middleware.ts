import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  isAuthenticatedNextjs,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const Routes = {
  public: "/auth",
} as const;

const isPublicRoute = createRouteMatcher([Routes.public]);

export default convexAuthNextjsMiddleware((request) => {
  if (!isPublicRoute(request) && !isAuthenticatedNextjs()) {
    return nextjsMiddlewareRedirect(request, Routes.public);
  } else if (isPublicRoute(request) && isAuthenticatedNextjs()) {
    return nextjsMiddlewareRedirect(request, "/");
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
