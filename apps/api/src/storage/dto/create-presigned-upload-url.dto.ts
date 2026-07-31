import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreatePresignedUploadUrlDto {

    @IsString()
    @MinLength(1)
    @MaxLength(50)
    fileName: string;

    @Matches(/^[a-zA-Z0-9-]+\/[a-zA-Z0-9-+.]+$/, {
        message: 'contentType debe tener un formato MIME válido (ej: image/png, application/pdf)',
    })
    contentType: string;
}
