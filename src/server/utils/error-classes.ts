export class FormattedError extends Error {
    public readonly sendMail: boolean | undefined;

    constructor(message: string, sendMail?: boolean) {
        super(message);
        this.name = "FormattedError";
        this.sendMail = sendMail;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, FormattedError);
        }
    }
}
