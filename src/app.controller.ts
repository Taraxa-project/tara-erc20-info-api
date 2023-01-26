import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';

@ApiTags('General')
@Controller('app')
export class AppController {
  @Get()
  async getRoutes() {
    const routes = JSON.parse(
      fs.readFileSync(`${__dirname}/../src/routes.json`).toString(),
    );
    return routes;
  }
}
