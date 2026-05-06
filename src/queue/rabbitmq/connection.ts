import {
    getRabbitMqUrl,
    HUBDO_BULK_LOOKUP_DLQ,
    HUBDO_BULK_LOOKUP_DLQ_ROUTING_KEY,
    HUBDO_BULK_LOOKUP_DLX_EXCHANGE,
    HUBDO_BULK_LOOKUP_EXCHANGE,
    HUBDO_BULK_LOOKUP_QUEUE,
    HUBDO_BULK_LOOKUP_ROUTING_KEY,
} from '@/queue/rabbitmq/constants';
import amqplib, { Channel, ChannelModel } from 'amqplib';

let connectionPromise: Promise<ChannelModel> | null = null;

async function createConnection(): Promise<ChannelModel> {
    const connection = await amqplib.connect(getRabbitMqUrl());
    connection.on('error', () => {
        connectionPromise = null;
    });
    connection.on('close', () => {
        connectionPromise = null;
    });
    return connection;
}

export async function getRabbitMqConnection(): Promise<ChannelModel> {
    if (!connectionPromise) {
        connectionPromise = createConnection();
    }

    return connectionPromise;
}

export async function createRabbitMqChannel(): Promise<Channel> {
    const connection = await getRabbitMqConnection();
    const channel = await connection.createChannel();
    await ensureHubdoBulkTopology(channel);
    return channel;
}

export async function ensureHubdoBulkTopology(channel: Channel): Promise<void> {
    await channel.assertExchange(HUBDO_BULK_LOOKUP_EXCHANGE, 'direct', { durable: true });
    await channel.assertExchange(HUBDO_BULK_LOOKUP_DLX_EXCHANGE, 'direct', { durable: true });

    await channel.assertQueue(HUBDO_BULK_LOOKUP_QUEUE, {
        durable: true,
        deadLetterExchange: HUBDO_BULK_LOOKUP_DLX_EXCHANGE,
        deadLetterRoutingKey: HUBDO_BULK_LOOKUP_DLQ_ROUTING_KEY,
    });

    await channel.assertQueue(HUBDO_BULK_LOOKUP_DLQ, { durable: true });

    await channel.bindQueue(
        HUBDO_BULK_LOOKUP_QUEUE,
        HUBDO_BULK_LOOKUP_EXCHANGE,
        HUBDO_BULK_LOOKUP_ROUTING_KEY,
    );

    await channel.bindQueue(
        HUBDO_BULK_LOOKUP_DLQ,
        HUBDO_BULK_LOOKUP_DLX_EXCHANGE,
        HUBDO_BULK_LOOKUP_DLQ_ROUTING_KEY,
    );
}
