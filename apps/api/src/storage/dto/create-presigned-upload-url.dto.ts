import { IsNotEmpty, IsNumber, IsString, Matches, Max, MaxLength, Min, MinLength } from "class-validator";

export class CreatePresignedUploadUrlDto {

    @IsString()
    @MinLength(1)
    @MaxLength(50)
    fileName: string;

    @Matches(/^[a-zA-Z0-9-]+\/[a-zA-Z0-9-+.]+$/, {
        message: 'contentType must be a valid MIME format (e.g. image/png, application/pdf)',
    })
    contentType: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(1, { message: 'File size must be greater than 0 bytes' })
    @Max(10 * 1024 * 1024, { message: `File size can't exceed 10MB` })
    //10MB in bytes (10,485,760)
    size: number;
}