import crypto from 'crypto'

export async function generateWompiSignature(reference: string, amountInCents: number, currency: string, secret: string) {
    const raw = `${reference}${amountInCents}${currency}${secret}`
    const signature = crypto.createHash('sha256').update(raw).digest('hex')
    return signature
}

export async function validateWompiSignature(data: any, timestamp: any, secret: string, receivedSignature: string) {
    // Wompi Events Signature Logic (V2):
    // SHA256(transaction.id + transaction.status + amount_in_cents + timestamp + secret)

    // Note: Wompi event payload structure varies. 
    // Usually: data.transaction.id, data.transaction.status, etc.
    // Check Wompi Docs: "checksum" property in event. 
    // Checksum = SHA256(transaction.id + transaction.status + amount_in_cents + timestamp + secret)

    const raw = `${data.transaction.id}${data.transaction.status}${data.transaction.amount_in_cents}${timestamp}${secret}`
    const calculated = crypto.createHash('sha256').update(raw).digest('hex')

    return calculated === receivedSignature
}
