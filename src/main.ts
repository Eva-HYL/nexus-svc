import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局前缀
  app.setGlobalPrefix('api');

  // 全局管道：参数校验
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 全局过滤器：统一异常处理
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局拦截器：统一响应格式
  app.useGlobalInterceptors(new TransformInterceptor());

  // CORS
  app.enableCors();

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);
  console.log(`🚀 elva-server running on: http://localhost:${port}/api`);
}

bootstrap();
