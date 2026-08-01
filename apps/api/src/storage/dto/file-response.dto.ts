import { Expose, Transform } from "class-transformer";

export class FileResponseDto {

    @Expose()
    @Transform(({ obj }) => obj._id?.toString())
    id: string;

    @Expose()
    originalName: string;

    @Expose()
    contentType: string;

    @Expose()
    size: number;

    @Expose()
    createdAt: Date;

    constructor(partial: Partial<FileResponseDto>) {
        Object.assign(this, partial);
    }
}