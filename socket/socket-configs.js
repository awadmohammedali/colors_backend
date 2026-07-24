import I18n from "i18n";
import {
  GENERAL_ERROR,
  ROOM_EXIST,
  ROOM_NOT_EXIST,
} from "../util/constants.js";
const TTL_IN_SECONDS = 3600;

const roomsDic = {};
const isEmpty = (obj) => {
  if (obj == null) {
    return true;
  } else if (Object.entries(obj).length === 0) {
    return true;
  } else {
    return false;
  }
};

export const createRoom = async (roomCode, player, redisClient) => {
  roomCode = roomCode.trim().toLowerCase();

  // Check if the room already exists in Redis
  const roomExists = await redisClient.exists(`room:${roomCode}`);
  if (roomExists === 1) {
    return { error: I18n.__(ROOM_EXIST) };
  }

  // Initialize the room in Redis
  const roomData = {
    adminId: player.id,
    players: {
      [player.id]: player,
    },
  };

  await redisClient.setEx(
    `room:${roomCode}`,
    TTL_IN_SECONDS,
    JSON.stringify(roomData),
  );

  return { players: [player] };
};

export const getRoomAdminId = async (roomCode, redisClient) => {
  var room = await redisClient.get(`room:${roomCode}`);
  room = JSON.parse(room);
  if (isEmpty(room)) {
    return { error: I18n.__(ROOM_NOT_EXIST) };
  }
  return { id: room.adminId };
};

export const checkRoomExsit = async ({ roomCode, redisClient }) => {
  roomCode = roomCode.trim().toLowerCase();
  const exists = await redisClient.exists(`room:${roomCode}`);
  return exists === 1;
};

export const addPlayerToRoom = async ({
  player,
  roomCode,
  roomData,
  redisClient,
}) => {
  roomData["players"][player.id] = player;
  var result = await redisClient.setEx(
    `room:${roomCode}`,
    TTL_IN_SECONDS,
    JSON.stringify(roomData),
  );

  console.log(`${player} is added to room ${roomCode}`);
};

export const removePlayer = async ({ id, roomCode, redisClient }) => {
  roomCode = roomCode.trim().toLowerCase();

  var roomData = await redisClient.get(`room:${roomCode}`);
  roomData = JSON.parse(roomData);
  if (isEmpty(roomData)) {
    return { error: I18n.__(ROOM_NOT_EXIST) };
  }

  const userExist = roomData.players.hasOwnProperty(id);
  if (!userExist) {
    return { error: I18n.__(GENERAL_ERROR) };
  }
  if (roomData.adminId == id) {
    var result = await redisClient.del(`room:${roomCode}`);
  } else {
    delete roomData.players[id];
    var result = await redisClient.setEx(
      `room:${roomCode}`,
      TTL_IN_SECONDS,
      JSON.stringify(roomData),
    );
  }
  var players = getFilteredPlayersList(roomData);
  return { players };
};

export const removeRoom = (roomCode) => {
  const exsitingRoom = roomsDic.hasOwnProperty(roomCode);
  if (!exsitingRoom) {
    return console.log("room is not removed");
  }
  delete roomsDic[roomCode];
  console.log("room is removed");
};

export const getDisconnectedPlayerData = (socketId) => {
  if (isEmpty(roomsDic)) {
    return { error: "something wrong" };
  }
  var player;
  var roomCode;
  for (const key in roomsDic) {
    if (!roomsDic.hasOwnProperty(key)) {
      return { error: "something wrong" };
    }
    if (roomCode) {
      break;
    }
    if (roomsDic[key].hasOwnProperty(socketId)) {
      roomCode = key;
      player = roomsDic[key][socketId];

      return { roomCode, player };
    }
  }
  return { error: "" };
};

export async function addAnswer(roomCode, playerId, answer, redisClient) {
  // Store the answer in a Redis hash for the room
  const key = `room${roomCode}answers`;
  const res1 = await redisClient.hSet(key, playerId, answer.toString());
}

export async function getAnswers(roomCode, redisClient) {
  const key = `room${roomCode}answers`;
  const answers = await redisClient.hGetAll(key, "$");
  console.log(answers);

  return answers;
}

export const getFilteredPlayersList = (roomData) => {
  var playersList = [];
  if (isEmpty(roomData)) {
    return [];
  }
  if (isEmpty(roomData.players)) {
    return [];
  }

  for (const key in roomData.players) {
    playersList.push(roomData.players[key]);
  }
  return playersList;
};
