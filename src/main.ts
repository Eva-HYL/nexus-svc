import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    // 全局前缀（排除健康检查端点）
    app.setGlobalPrefix('api', {
      exclude: ['health', ''],
    });

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

    // 云托管注入 PORT 环境变量，本地开发使用 APP_PORT 或 3000
    const port = process.env.PORT || process.env.APP_PORT || 3000;
    
    console.log(`Starting server on port: ${port}`);
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 nexus-server running on port: ${port}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();