// src/main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/transform.interceptor';

function parseOrigins(s?: string) {
  if (!s) return ['*'];
  return s.split(',').map(x => x.trim()).filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // <<< CORS >>>
  const origins = parseOrigins(process.env.CORS_ORIGIN);
  app.enableCors({
    origin: (origin, cb) => {
      // Permite llamadas desde Vercel y desde tools (sin Origin)
      if (!origin || origins.includes('*') || origins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: false,         // poné true solo si usás cookies/autenticación por credenciales
    optionsSuccessStatus: 204,  // status para preflight OK
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new TransformInterceptor());

  const port = process.env.PORT || 8080; // Cloud Run inyecta PORT
  await app.listen(port as number, '0.0.0.0');
  console.log(`API lista en http://localhost:${port}/api`);
}
bootstrap();
