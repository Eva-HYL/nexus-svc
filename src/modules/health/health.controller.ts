import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get()
  index() {
    return { 
      name: 'nexus-server',
      version: '1.0.0',
      status: 'running'
    };
  }
}