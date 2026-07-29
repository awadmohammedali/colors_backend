import { getRoomData, saveRoomData } from "./repository.js";

export default function registerBlueSocketHandlers({ io, socket }) {
  socket.on(
    "general-categories-selections-submitted",
    async ({ roomId, playerId, selectedCategoryIds }, callback) => {
      try {
        if (!roomId || !playerId || !Array.isArray(selectedCategoryIds)) {
          return callback?.({
            success: false,
            error: "Invalid request data",
          });
        }

        const roomData = await getRoomData(roomId);

        const playerExists = roomData.players.some(
          (player) => player.playerId === playerId,
        );

        if (!playerExists) {
          return callback?.({
            success: false,
            error: "Player does not belong to this room",
          });
        }

        savePlayerCategorySelections({
          roomData,
          playerId,
          selectedCategoryIds,
        });

        await saveRoomData(roomId, roomData);

        socket.to(roomId).emit("blue:player-category-selections-submitted", {
          playerId,
        });

        callback?.({
          success: true,
        });
      } catch (error) {
        console.error("Failed to save Blue category selections:", error);

        callback?.({
          success: false,
          error: "Unable to save category selections",
        });
      }
    },
  );

  socket.on(
    "blue:finalize-categories",
    async ({ roomId, playerId }, callback) => {
      try {
        const roomData = await getRoomData(roomId);

        if (roomData.hostPlayerId !== playerId) {
          return callback?.({
            success: false,
            error: "Only the host can finalize categories",
          });
        }

        finalizeBlueCategories({
          roomData,
          maximumSelectedCategories: 4,
        });

        await saveRoomData(roomId, roomData);

        io.to(roomId).emit("blue:categories-finalized", {
          selectedCategories: roomData.games.blue.selectedCategories,
        });

        callback?.({
          success: true,
        });
      } catch (error) {
        console.error("Failed to finalize Blue categories:", error);

        callback?.({
          success: false,
          error: "Unable to finalize categories",
        });
      }
    },
  );
}
