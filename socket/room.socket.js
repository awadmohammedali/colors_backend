import {
  createPlayer,
  createRoom,
  removePlayerFromRoom,
} from "../games/game-function.js";
import {
  saveRoomData,
  getRoomData,
  deleteRoomData,
} from "../socket/repository.js";

export default function initializeRoomSocket(io, socket) {
  socket.on("room:create", async ({ roomId, player }, callback) => {
    try {
      // 1. Validate payload
      if (!roomId || !player?.id) {
        return callback({
          code: 1,
          message: "Invalid request.",
        });
      }

      // 2. Check if room already exists
      const existingRoom = await getRoomData({ roomId });

      if (existingRoom) {
        return callback({
          code: 1,
          message: "Room already exists.",
        });
      }

      // 3. Create room data
      const roomData = createRoom({
        roomId,
        player,
      });

      // 4. Save room data in Redis
      await saveRoomData({ roomId, roomData });

      // 5. Add this socket to the Socket.IO room
      await socket.join(roomId);

      // 6. Return the created room
      return callback({
        code: 0,
        room: roomData,
      });
    } catch (error) {
      console.error("room:create error:", error);

      return callback({
        code: 1,
        message: "Failed to create room.",
      });
    }
  });

  // ----------------------------------------------
  // ROOM: JOIN REQUEST
  // ----------------------------------------------

  socket.on("room:join-request", async ({ roomId, player }, callback) => {
    try {
      if (!roomId || !player?.id) {
        return callback({
          code: 1,
          message: "Invalid request.",
        });
      }

      const roomData = await getRoomData({ roomId });

      if (!roomData) {
        return callback({
          code: 1,
          message: "Room does not exist.",
        });
      }

      const playerAlreadyExists = roomData.players.some(
        (currentPlayer) => currentPlayer.id === player.id,
      );

      if (playerAlreadyExists) {
        return callback({
          code: 1,
          message: "Player already exists in the room.",
        });
      }

      const hostPlayer = roomData.players.find(
        (currentPlayer) => currentPlayer.id === roomData.hostPlayerId,
      );

      if (!hostPlayer?.socketId) {
        return callback({
          code: 1,
          message: "Room host is not connected.",
        });
      }

      const joiningPlayer = {
        ...player,
        socketId: socket.id,
      };

      io.to(hostPlayer.socketId).emit("room:join-requested", {
        roomId,
        player: joiningPlayer,
      });

      return callback({
        code: 0,
        message: "Join request sent.",
      });
    } catch (error) {
      console.error("room:join-request error:", error);

      return callback({
        code: 1,
        message: "Failed to send join request.",
      });
    }
  });

  // ----------------------------------------------
  // ROOM: JOIN RESPONSE
  // ----------------------------------------------
  socket.on("room:join-request", async ({ roomId, player }, callback) => {
    try {
      if (!roomId || !player?.id) {
        return callback({
          code: 1,
          message: "Invalid request.",
        });
      }

      const roomData = await getRoomData({ roomId });

      if (!roomData) {
        return callback({
          code: 1,
          message: "Room does not exist.",
        });
      }

      const playerAlreadyExists = roomData.players.some(
        (currentPlayer) => currentPlayer.id === player.id,
      );

      if (playerAlreadyExists) {
        return callback({
          code: 1,
          message: "Player already exists in the room.",
        });
      }

      const hostPlayer = roomData.players.find(
        (currentPlayer) => currentPlayer.id === roomData.hostPlayerId,
      );

      if (!hostPlayer?.socketId || !hostPlayer.isConnected) {
        return callback({
          code: 1,
          message: "Room host is not connected.",
        });
      }

      const joiningPlayer = {
        ...player,
        socketId: socket.id,
        isConnected: true,
      };

      io.to(hostPlayer.socketId)
        .timeout(30000)
        .emit(
          "room:join-requested",
          {
            roomId,
            player: joiningPlayer,
          },
          async (error, hostResponses) => {
            try {
              if (error) {
                return callback({
                  code: 1,
                  message: "The host did not respond.",
                });
              }

              const hostResponse = hostResponses;

              if (!hostResponse?.accepted) {
                return callback({
                  code: 1,
                  accepted: false,
                  message: "Your join request was rejected.",
                });
              }

              const latestRoomData = await getRoomData({ roomId });

              if (!latestRoomData) {
                return callback({
                  code: 1,
                  message: "Room no longer exists.",
                });
              }

              const playerAlreadyJoined = latestRoomData.players.some(
                (currentPlayer) => currentPlayer.id === joiningPlayer.id,
              );

              if (playerAlreadyJoined) {
                return callback({
                  code: 1,
                  message: "Player already exists in the room.",
                });
              }

              const newPlayer = createPlayer({
                playerId: joiningPlayer.id,
                socketId: joiningPlayer.socketId,
                name: joiningPlayer.name,
                isAdmin: false,
              });
              latestRoomData.players.push(newPlayer);
              await saveRoomData({ roomId, roomData: latestRoomData });

              // The joining player's socket now joins the Socket.IO room.
              await socket.join(roomId);

              // Broadcast the updated room to everyone:
              // host + existing players + newly joined player.
              io.to(roomId).emit("room:state-updated", {
                room: latestRoomData,
              });

              return callback({
                code: 0,
                accepted: true,
                room: latestRoomData,
              });
            } catch (error) {
              console.error("Host response processing error:", error);

              return callback({
                code: 1,
                message: "Failed to process the host response.",
              });
            }
          },
        );
    } catch (error) {
      console.error("room:join-request error:", error);

      return callback({
        code: 1,
        message: "Failed to send join request.",
      });
    }
  });
  // ----------------------------------------------
  // ROOM: REJOIN
  // ----------------------------------------------

  socket.on("room:rejoin", async ({ roomId, playerId }, callback) => {
    try {
      if (!roomId || !playerId) {
        return callback({
          code: 1,
          message: "Invalid request.",
        });
      }

      const roomData = await getRoomData({ roomId });

      if (!roomData) {
        return callback({
          code: 1,
          message: "Room does not exist.",
        });
      }

      const player = roomData.players.find(
        (currentPlayer) => currentPlayer.id === playerId,
      );

      if (!player) {
        return callback({
          code: 1,
          message: "Player does not exist in the room.",
        });
      }

      const updatedRoom = reconnectPlayerToRoom({
        roomData,
        playerId,
        socketId: socket.id,
      });

      await saveRoomData(roomId, updatedRoom);

      await socket.join(roomId);

      const isHost = roomData.hostPlayerId === playerId;

      if (isHost) {
        io.to(roomId).emit("room:host-reconnected", {
          playerId,
          room: updatedRoom,
        });
      } else {
        io.to(roomId).emit("room:player-reconnected", {
          playerId,
          room: updatedRoom,
        });
      }

      io.to(roomId).emit("room:players-updated", {
        room: updatedRoom,
      });

      return callback({
        code: 0,
        room: updatedRoom,
      });
    } catch (error) {
      console.error("room:rejoin error:", error);

      return callback({
        code: 1,
        message: "Failed to rejoin room.",
      });
    }
  });

  // ----------------------------------------------
  // ROOM: LEAVE
  // ----------------------------------------------

  socket.on("room:leave", async ({ roomId, playerId }, callback) => {
    try {
      if (!roomId || !playerId) {
        return callback({
          code: 1,
          message: "Invalid request.",
        });
      }

      const roomData = await getRoomData({ roomId });

      if (!roomData) {
        return callback({
          code: 1,
          message: "Room does not exist.",
        });
      }

      const leavingPlayer = roomData.players.find(
        (player) => player.id === playerId,
      );

      if (!leavingPlayer) {
        return callback({
          code: 1,
          message: "Player does not exist in the room.",
        });
      }

      if (leavingPlayer.socketId !== socket.id) {
        return callback({
          code: 1,
          message: "You cannot leave on behalf of another player.",
        });
      }

      const isHost = roomData.hostPlayerId === playerId;

      if (isHost) {
        await deleteRoomData({ roomId });

        io.to(roomId).emit("room:closed", {
          roomId,
          reason: "The host left the room.",
        });

        await io.in(roomId).socketsLeave(roomId);

        return callback({
          code: 0,
          roomClosed: true,
        });
      }

      const updatedRoom = removePlayerFromRoom({
        roomData,
        playerId,
      });

      await saveRoomData(roomId, updatedRoom);

      await socket.leave(roomId);

      io.to(roomId).emit("room:players-updated", {
        room: updatedRoom,
      });

      return callback({
        code: 0,
        room: updatedRoom,
      });
    } catch (error) {
      console.error("room:leave error:", error);

      return callback({
        code: 1,
        message: "Failed to leave room.",
      });
    }
  });

  // ----------------------------------------------
  // ROOM: REMOVE PLAYER
  // ----------------------------------------------

  socket.on("room:remove-player", async ({ roomId, playerId }, callback) => {
    try {
      if (!roomId || !playerId) {
        return callback({
          code: 1,
          message: "Invalid request.",
        });
      }

      const roomData = await getRoomData({ roomId });

      if (!roomData) {
        return callback({
          code: 1,
          message: "Room does not exist.",
        });
      }

      const hostPlayer = roomData.players.find(
        (player) => player.id === roomData.hostPlayerId,
      );

      if (!hostPlayer || hostPlayer.socketId !== socket.id) {
        return callback({
          code: 1,
          message: "Only the host can remove players.",
        });
      }

      if (playerId === roomData.hostPlayerId) {
        return callback({
          code: 1,
          message: "The host cannot remove themselves.",
        });
      }

      const playerToRemove = roomData.players.find(
        (player) => player.id === playerId,
      );

      if (!playerToRemove) {
        return callback({
          code: 1,
          message: "Player does not exist in the room.",
        });
      }

      const updatedRoom = removePlayerFromRoom({
        roomData,
        playerId,
      });

      await saveRoomData(roomId, updatedRoom);

      const playerSocket = io.sockets.sockets.get(playerToRemove.socketId);
      await playerSocket.leave(roomId);

      playerSocket.emit("room:players-updated", {
        room: updatedRoom,
      });

      return callback({
        code: 0,
        room: updatedRoom,
      });
    } catch (error) {
      console.error("room:remove-player error:", error);

      return callback({
        code: 1,
        message: "Failed to remove player.",
      });
    }
  });

  socket.on("disconnect", async (reason) => {
    try {
      console.log(`Socket disconnected: ${socket.id}, Reason: ${reason}`);
    } catch (error) {
      console.error("room disconnect error:", error);
    }
  });
}
