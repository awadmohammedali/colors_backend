import { redisClient } from "../config/redis.js";

export const saveRoomData = async ({ roomId, roomData }) => {
  await redisClient.set(`room:${roomId}`, JSON.stringify(roomData));
};

export const getRoomData = async ({ roomId }) => {
  const roomData = await redisClient.get(`room:${roomId}`);

  if (!roomData) {
    throw new Error("Room not found");
  }

  return JSON.parse(roomData);
};

export const deleteRoomData = async ({ roomId }) => {
  await redisClient.del(`room:${roomId}`);
};
