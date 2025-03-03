import dotenv from 'dotenv';

dotenv.config();

const { ZENDESK_URL, ZENDESK_EMAIL, ZENDESK_TOKEN } = process.env;

export const zendeskConfig = {
    url: ZENDESK_URL,
    headers: {
        'Authorization': `Basic ${Buffer.from(
            `${ZENDESK_EMAIL}/token:${ZENDESK_TOKEN}`
        ).toString('base64')}`,
        'Content-Type': 'application/json',
    }
}; 