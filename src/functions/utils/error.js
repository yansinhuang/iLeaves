export function ErrorWithCode(message, code = 403) {
    const err = Error(message)
    err.code = code
    return err
}