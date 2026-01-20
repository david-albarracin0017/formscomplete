// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Solo protegemos la ruta /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return new NextResponse('Autenticación requerida', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin Panel"' },
      });
    }

    // Usuario y contraseña sencillos (ej: admin / 12345)
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];

    if (user !== 'admin' || pass !== '12345') {
      return new NextResponse('Credenciales inválidas', { status: 401 });
    }
  }
  return NextResponse.next();
}