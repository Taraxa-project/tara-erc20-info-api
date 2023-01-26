import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Taraxa Ecosystem Details API OpenAPI Documentation')
    .setDescription('Taraxa Ecosystem Details API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('apidocs', app, document);

  await app.listen(process.env.PORT || 3000);

  const server = app.getHttpServer();

  const router = server._events.request._router;

  const existingRoutes: [] = router.stack
    .map((routeObj) => {
      if (routeObj.route) {
        return {
          route: {
            path: routeObj.route?.path,
            method: routeObj.route?.stack[0].method,
          },
        };
      }
    })
    .filter((item) => item !== undefined);
  fs.write;
  fs.writeFileSync(
    `${__dirname}/../src/routes.json`,
    Buffer.from(JSON.stringify(existingRoutes)),
  );
}
bootstrap();
