import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局前缀（排除根路径和健康检查）
  app.setGlobalPrefix('api', {
    exclude: ['/', 'health'],
  });

  // 全局管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors();

  // 云托管会注入 PORT 环境变量
  const port = parseInt(process.env.PORT || '3000', 10);
  
  await app.listen(port, '0.0.0.0');
  console.log(`Server running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('Startup failed:', err);
  process.exit(1);
});