import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    console.log('Starting application...');
    
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

    // 云托管会注入 PORT 环境变量，默认 80
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 80;
    
    console.log(`Attempting to listen on port ${port}...`);
    await app.listen(port, '0.0.0.0');
    console.log(`✅ Server successfully running on port ${port}`);
  } catch (error) {
    console.error('❌ Startup failed:', error);
    process.exit(1);
  }
}

bootstrap();