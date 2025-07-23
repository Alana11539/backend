import { createClient } from "redis";

const redisClient = createClient({
  url: "redis://default:H9VKbIMABwwEoTyDvpslJfEpoUxT8LQ2@redis-10924.c212.ap-south-1-1.ec2.redns.redis-cloud.com:10924"
});

redisClient.on("error", (err) => console.error("❌ Redis Error:", err));
redisClient.on("connect", () => console.log("✅ Redis Connected"));

await redisClient.connect();

export default redisClient;
