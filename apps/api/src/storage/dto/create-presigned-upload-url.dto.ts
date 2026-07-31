import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreatePresignedUploadUrlDto {

    @IsString()
    @MinLength(1)
    @MaxLength(50)
    fileName: string;

    @Matches(/^[a-zA-Z0-9-]+\/[a-zA-Z0-9-+.]+$/, {
        message: 'contentType must be a valid MIME format (e.g. image/png, application/pdf)',
    })
    contentType: string;
}
