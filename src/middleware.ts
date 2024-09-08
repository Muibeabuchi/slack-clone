import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  isAuthenticatedNextjs,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const Routes = {
  // signIn: "/sign-in",
  public: "/auth",
} as const;

// const isSignInPage = createRouteMatcher(["/"]);
// const isSignInRoute = createRouteMatcher([Routes.signIn]);
const isPublicRoute = createRouteMatcher([Routes.public]);

export default convexAuthNextjsMiddleware((request) => {
  // if (
  //   (!isPublicRoute(request) || !isSignInRoute(request)) &&
  //   !isAuthenticatedNextjs()
  // ) {
  //   return nextjsMiddlewareRedirect(request, Routes.signIn);
  // }
  // if (isSignInRoute(request) && isAuthenticatedNextjs()) {
  //   return nextjsMiddlewareRedirect(request, Routes.public);
  // }
  if (!isPublicRoute(request) && !isAuthenticatedNextjs()) {
    return nextjsMiddlewareRedirect(request, Routes.public);
  } else if (isPublicRoute(request) && isAuthenticatedNextjs()) {
    return nextjsMiddlewareRedirect(request, "/");
  }
  // todo: Redirect user away from signin if authenticated
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
