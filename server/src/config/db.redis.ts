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

    await client.connect();
    return client;
  } catch (error) {
    // Optionally handle error
  }
};

