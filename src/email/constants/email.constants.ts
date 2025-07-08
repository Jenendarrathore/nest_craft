console.log('[EMAIL_QUEUE]', process.env.EMAIL_QUEUE_NAME); // 👈 log it
export const EMAIL_QUEUE = process.env.EMAIL_QUEUE_NAME || 'email_queue';
