import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Revisamos si existe la cookie de sesión
  const session = request.cookies.get('admin_session');

  // 1. SI INTENTA ENTRAR A /ADMIN SIN COOKIE -> LO MANDA AL LOGIN AZUL
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. SI YA ESTÁ LOGUEADO E INTENTA IR AL LOGIN -> LO MANDA AL ADMIN
  if (pathname === '/login') {
    if (session) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

// Configuración para que el middleware solo actúe en estas rutas
export const config = {
  matcher: ['/admin/:path*', '/login'],
};