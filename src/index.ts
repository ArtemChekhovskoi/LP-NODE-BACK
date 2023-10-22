import express, { Express } from "express";
import "dotenv/config";
import { json } from "body-parser";
import cors from "cors";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import rateLimit from "express-rate-limit";
import { mongoMain } from "@helpers/mongoConnectionManager";
import { apiErrorsHandler } from "@helpers/apiErrorsHandler";
import routes from "./routes";
import { logger } from "./logger";
import config from "../config";

process.on("SIGINT", async () => {
  await mongoMain.destroy();
  process.exit(0);
});
class App {
  app: Express;

  port = config.server.port;

  logger;

  constructor() {
    this.app = express();
    this.logger = logger;
  }

  useMiddlewares() {
    this.app.use(json());
    this.app.use(cors());
  }

  useRateLimit() {
    const limiter = rateLimit({
      windowMs: 0.02 * 60 * 1000,
      max: 5,
      message:
        "Too many requests from this IP, please try again after 15 minutes",
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });
    this.app.use("/api", limiter);
  }

  useSwagger() {
    const swaggerOptions = {
      ...config.swagger,
      apis: ["./*.ts", "./**/*.ts"],
    };
    const specs = swaggerJsdoc(swaggerOptions);
    this.app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs));
    this.logger.info(
      `Swagger started at http://localhost:${this.port}/api/docs`,
    );
  }

  useRoutes() {
    this.app.use("/api", routes);
  }

  useErrorHandler() {
    this.app.use(apiErrorsHandler);
  }

  public async init() {
    this.useMiddlewares();
    this.useRateLimit();
    this.useRoutes();
    this.useSwagger();
    this.useErrorHandler();
    this.app.listen(process.env.PORT || this.port);
    this.logger.info(`Server running at http://localhost:${this.port}/`);
  }
}

const app = new App();
app.init();
