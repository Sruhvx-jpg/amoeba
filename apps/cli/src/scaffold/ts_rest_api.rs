use anyhow::Result;
use std::path::Path;

use crate::types::DatabaseEngine;
use crate::utils::fs::write_file;

pub fn write_ts_rest_api_files(base_dir: &Path, project_name: &str, database: DatabaseEngine) -> Result<()> {
    let api_dir = base_dir.join("apps").join("api");

    // 1. package.json
    let pkg_json = match database {
        DatabaseEngine::Drizzle => format!(
            r#"{{
  "name": "{project_name}-api",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {{
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }},
  "dependencies": {{
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "drizzle-orm": "^0.38.4",
    "express": "^4.21.2",
    "pg": "^8.13.1",
    "zod": "^3.24.2"
  }},
  "devDependencies": {{
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/node": "^22.13.4",
    "@types/pg": "^8.11.11",
    "drizzle-kit": "^0.30.4",
    "tsx": "^4.19.3",
    "typescript": "^5.7.3"
  }}
}}
"#
        ),
        _ => format!(
            r#"{{
  "name": "{project_name}-api",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {{
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }},
  "dependencies": {{
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "mongoose": "^8.10.1",
    "zod": "^3.24.2"
  }},
  "devDependencies": {{
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/node": "^22.13.4",
    "tsx": "^4.19.3",
    "typescript": "^5.7.3"
  }}
}}
"#
        ),
    };
    write_file(api_dir.join("package.json"), &pkg_json)?;

    // 2. tsconfig.json
    let tsconfig_json = r#"{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
"#;
    write_file(api_dir.join("tsconfig.json"), tsconfig_json)?;

    // 3. .env and .env.example
    let (env_content, db_url_default) = match database {
        DatabaseEngine::Drizzle => (
            format!(
                r#"PORT=3000
NODE_ENV=development
DATABASE_URL=postgres://postgres:postgres@localhost:5432/{project_name}
"#
            ),
            format!("postgres://postgres:postgres@localhost:5432/{project_name}"),
        ),
        _ => (
            format!(
                r#"PORT=3000
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/{project_name}
"#
            ),
            format!("mongodb://localhost:27017/{project_name}"),
        ),
    };
    write_file(api_dir.join(".env"), &env_content)?;
    write_file(api_dir.join(".env.example"), &env_content)?;

    // 4. src/config/index.ts
    let config_ts = format!(
        r#"import dotenv from "dotenv";

dotenv.config();

export const config = {{
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "{db_url_default}",
}};
"#
    );
    write_file(api_dir.join("src/config/index.ts"), &config_ts)?;

    // 5. src/utils/apiErr.ts (ApiError class with constructor(message, statusCode) and dataAlreadyExists method)
    let api_err_ts = r#"/**
 * Standard API Error Class
 * Formats operational errors with customizable HTTP status code and message.
 */
export class ApiError extends Error {
  public statusCode: number;
  public success: boolean;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.success = false;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Conflict helper (409) for duplicate/already existing records.
   * Can be instantiated directly or called as a factory with an overridable message.
   */
  dataAlreadyExists(message: string = "Resource already exists"): ApiError {
    return new ApiError(message, 409);
  }

  static dataAlreadyExists(message: string = "Resource already exists"): ApiError {
    return new ApiError(message, 409);
  }

  static badRequest(message: string = "Bad request"): ApiError {
    return new ApiError(message, 400);
  }

  static unauthorized(message: string = "Unauthorized"): ApiError {
    return new ApiError(message, 401);
  }

  static forbidden(message: string = "Forbidden"): ApiError {
    return new ApiError(message, 403);
  }

  static notFound(message: string = "Resource not found"): ApiError {
    return new ApiError(message, 404);
  }

  static internal(message: string = "Internal server error"): ApiError {
    return new ApiError(message, 500, false);
  }
}

export const apiErr = ApiError;
export default ApiError;
"#;
    write_file(api_dir.join("src/utils/apiErr.ts"), api_err_ts)?;

    // 6. src/utils/apiRes.ts (ApiResponse class with constructor(message, statusCode, data))
    let api_res_ts = r#"import { Response } from "express";

/**
 * Standard API Response Class
 * Standardizes outbound responses across all modules.
 */
export class ApiResponse<T = any> {
  public success: boolean;
  public statusCode: number;
  public message: string;
  public data: T | null;

  constructor(message: string, statusCode: number = 200, data: T | null = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  static ok<T>(data: T, message: string = "Success"): ApiResponse<T> {
    return new ApiResponse(message, 200, data);
  }

  static created<T>(data: T, message: string = "Resource created successfully"): ApiResponse<T> {
    return new ApiResponse(message, 201, data);
  }

  static send<T>(res: Response, statusCode: number, message: string, data: T | null = null): Response {
    const payload = new ApiResponse(message, statusCode, data);
    return res.status(statusCode).json(payload);
  }
}

export const apiRes = ApiResponse;
export default ApiResponse;
"#;
    write_file(api_dir.join("src/utils/apiRes.ts"), api_res_ts)?;

    // 7. src/utils/baseDto.ts (Base DTO Class with Zod schema validation)
    let base_dto_ts = r#"import { ZodSchema } from "zod";
import { ApiError } from "./apiErr.js";

/**
 * Base DTO Class
 * Provides async and sync schema validation for module DTOs.
 */
export abstract class BaseDto<T> {
  abstract schema: ZodSchema<T>;

  validate(data: unknown): T {
    const result = this.schema.safeParse(data);
    if (!result.success) {
      const msg = result.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      throw ApiError.badRequest(`Validation error: ${msg}`);
    }
    return result.data;
  }

  async validateAsync(data: unknown): Promise<T> {
    const result = await this.schema.safeParseAsync(data);
    if (!result.success) {
      const msg = result.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      throw ApiError.badRequest(`Validation error: ${msg}`);
    }
    return result.data;
  }
}

export default BaseDto;
"#;
    write_file(api_dir.join("src/utils/baseDto.ts"), base_dto_ts)?;

    // 8. src/middleware/errorHandler.ts
    let error_handler_ts = r#"import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiErr.js";

export function errorHandler(
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
    });
  }

  console.error("💥 Unhandled Internal Error:", err);
  return res.status(500).json({
    success: false,
    statusCode: 500,
    message: "Internal server error",
  });
}
"#;
    write_file(api_dir.join("src/middleware/errorHandler.ts"), error_handler_ts)?;

    // 9. Database layer
    match database {
        DatabaseEngine::Drizzle => write_drizzle_files(&api_dir, project_name)?,
        _ => write_mongoose_files(&api_dir)?,
    }

    // 10. Module: health (Health DTO, Service, Controller, Routes)
    let health_dto_ts = r#"import { z } from "zod";
import { BaseDto } from "../../utils/baseDto.js";

export const healthSchema = z.object({
  status: z.string(),
  database: z.string(),
  uptime: z.number(),
});

export type HealthData = z.infer<typeof healthSchema>;

export class HealthDto extends BaseDto<HealthData> {
  schema = healthSchema;
}
"#;
    write_file(api_dir.join("src/modules/health/health.dto.ts"), health_dto_ts)?;

    let health_service_ts = match database {
        DatabaseEngine::Drizzle => r#"import { pool } from "../../database/index.js";
import { HealthData } from "./health.dto.js";

export class HealthService {
  async check(): Promise<HealthData> {
    let dbStatus = "connected";
    try {
      const client = await pool.connect();
      await client.query("SELECT 1");
      client.release();
    } catch {
      dbStatus = "disconnected";
    }

    return {
      status: "ok",
      database: dbStatus,
      uptime: process.uptime(),
    };
  }
}
"#,
        _ => r#"import mongoose from "mongoose";
import { HealthData } from "./health.dto.js";

export class HealthService {
  async check(): Promise<HealthData> {
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    return {
      status: "ok",
      database: dbStatus,
      uptime: process.uptime(),
    };
  }
}
"#,
    };
    write_file(api_dir.join("src/modules/health/health.service.ts"), health_service_ts)?;

    let health_controller_ts = r#"import { Request, Response, NextFunction } from "express";
import { HealthService } from "./health.service.js";
import { ApiResponse } from "../../utils/apiRes.js";

export class HealthController {
  private service: HealthService;

  constructor() {
    this.service = new HealthService();
  }

  check = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.check();
      res.status(200).json(ApiResponse.ok(result, "Service is healthy"));
    } catch (error) {
      next(error);
    }
  };
}
"#;
    write_file(api_dir.join("src/modules/health/health.controller.ts"), health_controller_ts)?;

    let health_routes_ts = r#"import { Router } from "express";
import { HealthController } from "./health.controller.js";

export function createHealthRoutes(): Router {
  const router = Router();
  const controller = new HealthController();

  router.get("/", controller.check);

  return router;
}
"#;
    write_file(api_dir.join("src/modules/health/health.routes.ts"), health_routes_ts)?;

    // 11. src/modules/routes.ts (Aggregates all module routes)
    let modules_routes_ts = r#"import { Router } from "express";
import { createHealthRoutes } from "./health/health.routes.js";

export function createApiRouter(): Router {
  const router = Router();

  // Mount modules
  router.use("/health", createHealthRoutes());

  return router;
}
"#;
    write_file(api_dir.join("src/modules/routes.ts"), modules_routes_ts)?;

    // 12. src/app.ts
    let app_ts = r#"import express from "express";
import cors from "cors";
import { createApiRouter } from "./modules/routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Mount API v1 router
  app.use("/api/v1", createApiRouter());

  // Global error handler
  app.use(errorHandler);

  return app;
}
"#;
    write_file(api_dir.join("src/app.ts"), app_ts)?;

    // 13. src/index.ts
    let index_ts = match database {
        DatabaseEngine::Drizzle => r#"import { createApp } from "./app.js";
import { config } from "./config/index.js";
import { pool } from "./database/index.js";

async function bootstrap() {
  if (!config.databaseUrl || config.databaseUrl.trim() === "") {
    console.error("\n❌ Amoeba Database Configuration Error:");
    console.error("   Missing required environment variable 'DATABASE_URL'.\n");
    console.error("   • Required Variable: DATABASE_URL");
    console.error("   • Expected Format:   postgres://username:password@localhost:5432/dbname");
    console.error("   • How to fix:        Configure DATABASE_URL in 'apps/api/.env' and ensure PostgreSQL is running.\n");
    process.exit(1);
  }

  try {
    const client = await pool.connect();
    client.release();
  } catch (err: any) {
    console.error("\n❌ Amoeba Database Connection Error:");
    console.error("   Could not establish a connection to PostgreSQL.\n");
    console.error("   • Required Variable: DATABASE_URL");
    console.error(`   • Current Value:     ${config.databaseUrl}`);
    console.error("   • Expected Format:   postgres://username:password@localhost:5432/dbname");
    console.error("   • How to fix:        Configure DATABASE_URL in 'apps/api/.env' and ensure PostgreSQL is running.\n");
    process.exit(1);
  }

  const app = createApp();

  app.listen(config.port, () => {
    console.log(`⚡ Amoeba Express API running on http://localhost:${config.port}`);
  });
}

bootstrap();
"#,
        _ => r#"import { createApp } from "./app.js";
import { config } from "./config/index.js";
import { connectDatabase } from "./database/index.js";

async function bootstrap() {
  await connectDatabase();
  const app = createApp();

  app.listen(config.port, () => {
    console.log(`⚡ Amoeba Express API running on http://localhost:${config.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
"#,
    };
    write_file(api_dir.join("src/index.ts"), index_ts)?;

    Ok(())
}

fn write_drizzle_files(api_dir: &Path, project_name: &str) -> Result<()> {
    // drizzle.config.ts
    let drizzle_config = format!(
        r#"import {{ defineConfig }} from "drizzle-kit";

export default defineConfig({{
  schema: "./src/database/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {{
    url: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/{project_name}",
  }},
}});
"#
    );
    write_file(api_dir.join("drizzle.config.ts"), &drizzle_config)?;

    // src/database/schema.ts
    let schema_ts = r#"import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const healthChecks = pgTable("health_checks", {
  id: uuid("id").defaultRandom().primaryKey(),
  status: text("status").notNull(),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
});
"#;
    write_file(api_dir.join("src/database/schema.ts"), schema_ts)?;

    // src/database/index.ts
    let db_index_ts = r#"import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { config } from "../config/index.js";
import * as schema from "./schema.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
});

export const db = drizzle(pool, { schema });
"#;
    write_file(api_dir.join("src/database/index.ts"), db_index_ts)?;

    Ok(())
}

fn write_mongoose_files(api_dir: &Path) -> Result<()> {
    // src/database/schema.ts
    let schema_ts = r#"import mongoose, { Schema } from "mongoose";

const HealthCheckSchema = new Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const HealthCheck = mongoose.model("HealthCheck", HealthCheckSchema);
"#;
    write_file(api_dir.join("src/database/schema.ts"), schema_ts)?;

    // src/database/index.ts
    let db_index_ts = r#"import mongoose from "mongoose";
import { config } from "../config/index.js";

export async function connectDatabase(): Promise<typeof mongoose> {
  if (!config.databaseUrl || config.databaseUrl.trim() === "") {
    console.error("\n❌ Amoeba Database Configuration Error:");
    console.error("   Missing required environment variable 'DATABASE_URL'.\n");
    console.error("   • Required Variable: DATABASE_URL");
    console.error("   • Expected Format:   mongodb://localhost:27017/dbname");
    console.error("   • How to fix:        Configure DATABASE_URL in 'apps/api/.env' and ensure MongoDB is running.\n");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(config.databaseUrl);
    console.log("✔ Connected to MongoDB successfully");
    return conn;
  } catch (error) {
    console.error("\n❌ Amoeba Database Connection Error:");
    console.error("   Could not establish a connection to MongoDB.\n");
    console.error("   • Required Variable: DATABASE_URL");
    console.error(`   • Current Value:     ${config.databaseUrl}`);
    console.error("   • Expected Format:   mongodb://localhost:27017/dbname");
    console.error("   • How to fix:        Configure DATABASE_URL in 'apps/api/.env' and ensure MongoDB is running.\n");
    process.exit(1);
  }
}
"#;
    write_file(api_dir.join("src/database/index.ts"), db_index_ts)?;

    Ok(())
}
