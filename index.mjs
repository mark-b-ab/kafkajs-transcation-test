import { Kafka } from 'kafkajs';

const topic = 'my-topic-name';

const client = new Kafka({
    clientId: 'transactional-client',
    brokers: ['localhost:9091', 'localhost:9092', 'localhost:9093'],
    logCreator: () => ({ label, log: { message } }) => console.log(`${label}: ${message}`),
});

const producer = client.producer({
    transactionalId: 'my-transactional-producer',
    maxInFlightRequests: 1,
    idempotent: true,
});

async function sendMessage() {
    const transaction = await producer.transaction();

    try {
        await transaction.send({ topic, messages: [{ value: 'test message' }] });

        await transaction.commit();
    } catch (e) {
        await transaction.abort();
    }
}

await producer.connect();

console.log('Sending message 1');
await sendMessage();

console.log('Sending message 2');
await sendMessage();

console.log('Sending message 3');
await sendMessage();

await producer.disconnect();

process.exit()