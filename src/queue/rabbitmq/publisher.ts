import { CredifyPhoneQueueMessage } from '@/credifyApis/domain/types';
import { HubdoBulkLookupFindMatchQueueMessage } from '@/hubdoCpf/domain/bulk-lookup-find-match-types';
import { HubdoBulkLookupQueueMessage } from '@/hubdoCpf/domain/bulk-lookup-types';
import { createRabbitMqChannel } from '@/queue/rabbitmq/connection';
import {
    CREDIFY_PHONE_LOOKUP_DLQ_ROUTING_KEY,
    CREDIFY_PHONE_LOOKUP_DLX_EXCHANGE,
    CREDIFY_PHONE_LOOKUP_EXCHANGE,
    CREDIFY_PHONE_LOOKUP_ROUTING_KEY,
    HUBDO_BULK_LOOKUP_DLQ_ROUTING_KEY,
    HUBDO_BULK_LOOKUP_DLX_EXCHANGE,
    HUBDO_BULK_LOOKUP_EXCHANGE,
    HUBDO_BULK_LOOKUP_FIND_MATCH_QUEUE,
    HUBDO_BULK_LOOKUP_ROUTING_KEY,
} from '@/queue/rabbitmq/constants';

export async function publishHubdoBulkLookupItem(message: HubdoBulkLookupQueueMessage): Promise<void> {
    const channel = await createRabbitMqChannel();

    try {
        channel.publish(
            HUBDO_BULK_LOOKUP_EXCHANGE,
            HUBDO_BULK_LOOKUP_ROUTING_KEY,
            Buffer.from(JSON.stringify(message)),
            {
                persistent: true,
                contentType: 'application/json',
                messageId: message.itemId,
                correlationId: message.jobId,
                headers: {
                    'x-job-id': message.jobId,
                    'x-item-id': message.itemId,
                    'x-attempt': message.attempt,
                },
            },
        );
    } finally {
        await channel.close();
    }
}

export async function publishHubdoBulkLookupDeadLetter(message: HubdoBulkLookupQueueMessage): Promise<void> {
    const channel = await createRabbitMqChannel();

    try {
        channel.publish(
            HUBDO_BULK_LOOKUP_DLX_EXCHANGE,
            HUBDO_BULK_LOOKUP_DLQ_ROUTING_KEY,
            Buffer.from(JSON.stringify(message)),
            {
                persistent: true,
                contentType: 'application/json',
                messageId: message.itemId,
                correlationId: message.jobId,
                headers: {
                    'x-job-id': message.jobId,
                    'x-item-id': message.itemId,
                    'x-attempt': message.attempt,
                },
            },
        );
    } finally {
        await channel.close();
    }
}

export async function publishHubdoBulkLookupFindMatchItem(message: HubdoBulkLookupFindMatchQueueMessage): Promise<void> {
    const channel = await createRabbitMqChannel();

    try {
        channel.sendToQueue(
            HUBDO_BULK_LOOKUP_FIND_MATCH_QUEUE,
            Buffer.from(JSON.stringify(message)),
            {
                persistent: true,
                contentType: 'application/json',
                messageId: message.itemId,
                correlationId: message.jobId,
                headers: {
                    'x-job-id': message.jobId,
                    'x-item-id': message.itemId,
                    'x-attempt': message.attempt,
                },
            },
        );
    } finally {
        await channel.close();
    }
}

export async function publishCredifyPhoneLookupItem(message: CredifyPhoneQueueMessage): Promise<void> {
    const channel = await createRabbitMqChannel();

    try {
        channel.publish(
            CREDIFY_PHONE_LOOKUP_EXCHANGE,
            CREDIFY_PHONE_LOOKUP_ROUTING_KEY,
            Buffer.from(JSON.stringify(message)),
            {
                persistent: true,
                contentType: 'application/json',
                messageId: message.itemId,
                correlationId: message.jobId,
                headers: {
                    'x-job-id': message.jobId,
                    'x-item-id': message.itemId,
                    'x-attempt': message.attempt,
                },
            },
        );
    } finally {
        await channel.close();
    }
}

export async function publishCredifyPhoneDeadLetter(message: CredifyPhoneQueueMessage): Promise<void> {
    const channel = await createRabbitMqChannel();

    try {
        channel.publish(
            CREDIFY_PHONE_LOOKUP_DLX_EXCHANGE,
            CREDIFY_PHONE_LOOKUP_DLQ_ROUTING_KEY,
            Buffer.from(JSON.stringify(message)),
            {
                persistent: true,
                contentType: 'application/json',
                messageId: message.itemId,
                correlationId: message.jobId,
                headers: {
                    'x-job-id': message.jobId,
                    'x-item-id': message.itemId,
                    'x-attempt': message.attempt,
                },
            },
        );
    } finally {
        await channel.close();
    }
}
