import { createClient, RedisClientType } from 'redis';
export const redisConnect = async () => {
  try {
    const client: RedisClientType = createClient({
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    });

    client.on('error', (err) => console.log('Redis Client Error', err));
    await client.connect();

    return client;
  } catch (error) {
    console.error('Error connecting to Redis:', error);
  }
};

