import "dotenv/config";
import env from 'env-var'

export const envs = {
    stage: env.get("STAGE").default("dev").asEnum(["dev", "prod"]),
    dbUrl: env.get("DB_URL").required().asString(),
    bucketAllowedOrigins: env.get("BUCKET_ALLOWED_ORIGINGS").required().asArray(","),
    dbName: env.get("DB_NAME").required().asString(),
}