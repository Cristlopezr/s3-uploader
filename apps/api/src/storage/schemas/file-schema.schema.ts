import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type FileDocument = HydratedDocument<File>

@Schema()
export class File {
    @Prop({ required: true })
    originalName: string;

    @Prop({ required: true, unique: true })
    s3Name: string
}

export const FileSchema = SchemaFactory.createForClass(File);