import { Logger } from "tslog";
import mongoose from "mongoose";

interface IMongoConnection {
  uri: string;
  options: object;
  log: Logger<any>;

  connect(): Promise<boolean>;
  getConnection(): any;
  healthCheck(): { isReady: boolean; readyState?: number; error?: unknown };
  destroy(): Promise<void>;
}
class MongoConnection implements IMongoConnection {
  uri: string;

  options: object;

  log: Logger<any>;

  mongooseConnection: any;

  constructor(logger: Logger<any>, connectionConfig: any) {
    this.mongooseConnection = null;
    this.log = logger;
    this.uri = connectionConfig.uri;
    this.options = connectionConfig.options;
    this.connect();
  }

  async connect() {
    if (this.mongooseConnection) {
      return false;
    }
    try {
      await mongoose.connect(this.uri, this.options);

      this.mongooseConnection = mongoose.connection;

      this.mongooseConnection.on("connected", () => {
        this.log.info(`Mongoose connected to ${this.uri}`);
      });
      this.mongooseConnection.on("error", (error: unknown) => {
        this.log.error(`Mongo error: ${error}`);
        this.log.error(error);
      });
      this.mongooseConnection.on("disconnected", () =>
        this.log.info(`Mongo disconnected from ${this.uri}`),
      );

      this.log.info(`Mongo successfully connected to ${this.uri}`);
    } catch (error) {
      this.log.fatal(`Mongo connection error to ${this.uri}. Reason:${error}`);
      this.log.fatal(error);
      process.exit(1);
    }
    return true;
  }

  getConnection() {
    if (!this.mongooseConnection) {
      throw new Error("Mongoose connection is not initialized");
    }
    return this.mongooseConnection;
  }

  healthCheck() {
    try {
      const { readyState } = this.mongooseConnection;

      const isReady = readyState === 1;

      return { isReady, readyState };
    } catch (error) {
      return { isReady: false, error };
    }
  }

  async destroy() {
    try {
      await this.mongooseConnection.removeAllListeners();
      await this.mongooseConnection.close();
      this.mongooseConnection = null;
      this.log.info(`Mongo successfully disconnected from ${this.uri}`);
    } catch (error) {
      this.log.fatal(`Mongo error on disconnect: ${error}`);
      this.log.fatal(error);
    }
  }
}

export { MongoConnection };
