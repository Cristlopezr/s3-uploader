import Joi from "joi"

export const EnvConfiguration = () => ({
    port: process.env.PORT,
    bucket_region: process.env.BUCKET_REGION,
    bucket_name: process.env.BUCKET_NAME,
    file_key_base: process.env.FILE_KEY_BASE,
    presigned_url_expires_in: process.env.PRESIGNED_URL_EXPIRES_IN
})

export const JoiValidationSchema = Joi.object({
    PORT: Joi.number().default(3000),
    BUCKET_REGION: Joi.string().required(),
    BUCKET_NAME: Joi.string().required(),
    FILE_KEY_BASE: Joi.string().required(),
    PRESIGNED_URL_EXPIRES_IN: Joi.number().default(300)
})