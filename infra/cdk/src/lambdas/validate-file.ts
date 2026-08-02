import { DeleteObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Context, S3Event } from "aws-lambda"
import { MongoClient } from "mongodb";
import { isValidFileType } from "./utils/file-validator";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const dbCollection = 'files'
const s3Client = new S3Client({});

let cachedDbClient: MongoClient | null = null;

async function getDbClient() {
    if (cachedDbClient) return cachedDbClient;

    const client = new MongoClient(process.env.DB_URL!);
    await client.connect();
    cachedDbClient = client;
    return client;
}

export const handler = async (event: S3Event, context: Context) => {

    //Do not wait mongo pool connections to close
    context.callbackWaitsForEmptyEventLoop = false;

    const dbClient = await getDbClient();
    const db = dbClient.db(process.env.DB_NAME!)
    const collection = db.collection(dbCollection);

    for (const record of event.Records) {
        const bucketName = record.s3.bucket.name;
        const fileKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
        const fileSize = record.s3.object.size;

        const deleteCommand = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: fileKey
        })
        try {
            if (fileSize > MAX_FILE_SIZE) {
                console.warn(`File rejected - file size: ${fileSize} bytes`)
                await collection.updateOne({ s3FileKey: fileKey }, { $set: { status: "FAILED", failedReason: "MAX_SIZE_EXCEEDED" } })
                await s3Client.send(deleteCommand)
                continue;
            }

            //bytes=0-511 It only downloads the first 512 bytes to extract the file header.
            const getObjectResponse = await s3Client.send(
                new GetObjectCommand({
                    Bucket: bucketName,
                    Key: fileKey,
                    Range: "bytes=0-511"
                })
            );

            const byteArray = await getObjectResponse.Body?.transformToByteArray();
            if (!byteArray) throw new Error(`Can't read file from s3`);

            const isValid = isValidFileType(Buffer.from(byteArray), getObjectResponse.ContentType ?? '');

            console.log(`Updating status ${fileKey}`)
            const updatePayload = isValid
                ? { status: "ACTIVE" }
                : { status: "FAILED", failedReason: "INVALID_FILE_TYPE" };
            await collection.updateOne({ s3FileKey: fileKey }, { $set: updatePayload });

            if (!isValid) {
                console.warn(`Deleting invalid file from s3 ${fileKey}`)
                await s3Client.send(deleteCommand)
            }
        } catch (error) {
            console.error(`Error processing file ${fileKey}: `, error);
            throw error
        }
    }
}