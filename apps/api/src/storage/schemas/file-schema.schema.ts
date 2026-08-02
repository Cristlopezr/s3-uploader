import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export enum FileStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    FAILED = 'FAILED'
}

export type FileDocument = HydratedDocument<File>

@Schema({ timestamps: true })
export class File {
    @Prop({ required: true })
    originalName: string;

    @Prop({ required: true, unique: true })
    s3FileKey: string

    @Prop({ required: true })
    size: number

    @Prop({ required: true })
    contentType: string;

    @Prop({ type: String, enum: FileStatus, default: FileStatus.PENDING })
    status: FileStatus;

    @Prop()
    failedReason: string;
}

export const FileSchema = SchemaFactory.createForClass(File);