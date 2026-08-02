const FILE_SIGNATURES: Record<string, string[]> = {
    "image/png": ["89504E47"],
    "image/jpeg": ["FFD8FF"],
    "image/gif": ["47494638"],
    "image/webp": ["52494646"],
    "application/pdf": ["25504446"],
    "application/zip": ["504B0304"],
    "application/x-zip-compressed": ["504B0304"],
    "audio/mpeg": ["494433", "FFFB", "FFF3", "FFF2"],
    "video/mp4": ["0000001866747970", "0000001C66747970", "0000002066747970"],
    "audio/wav": ["52494646"],
    "audio/x-wav": ["52494646"],
};

export const isValidFileType = (buffer: Buffer, expectedContentType: string): boolean => {

    const signatures = FILE_SIGNATURES[expectedContentType];

    if (!signatures) {
        console.warn('No file signature found on FILE_SIGNATURES')
        return false;
    }

    //convert buffer start to a string hexadecimal in uppercase
    const hexHeader = buffer.toString("hex", 0, 16).toUpperCase();

    return signatures.some((signature) => hexHeader.startsWith(signature))
}