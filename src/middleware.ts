// This is the v4 way of exporting middleware
export { default } from "next-auth/middleware"

// This config specifies which routes the middleware should protect.
export const config = { 
    matcher: ["/dashboard/:path*", "/builder/:path*"] 
};