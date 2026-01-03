import { createClient, RedisClientType } from "redis";

let client: RedisClientType | null = null;
let isConnected = false;

// Only connect if REDIS_URL is defined
if (process.env.REDIS_URL) {
  client = createClient({
    url: process.env.REDIS_URL,
  });

  client.on("error", (err) => {
    if (!isConnected) {
      console.warn("Redis connection failed (optional service)");
    }
  });
  
  client.on("connect", () => {
    isConnected = true;
    console.log("Redis connected");
  });

  // Connect asynchronously
  (async () => {
    try {
      await client?.connect();
    } catch (error) {
      console.warn("Redis not available (skipping)");
    }
  })();
} else {
  console.log("Redis URL not configured (skipping)");
}

export default { client, isConnected };
