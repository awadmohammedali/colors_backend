import { BLUE, GREEN, PURPLE, RED, WHITE, YELLOW } from "../util/constants.js";
import { getRoomData, saveRoomData } from "./repository.js";

export default function initializeGameSocket({ io, socket }) {
  socket.on("game:start-round", async ({ roomId }, callback) => {
    try {
      const roomData = await getRoomData({ roomId });

      if (!roomData) {
        return callback?.({
          code: 1,
          message: "Room not found",
        });
      }

      roomData.currentColorIndex++;

      roomData.isFinished =
        roomData.currentColorIndex >= roomData.gameStages.length;

      await saveRoomData(roomId, roomData);

      if (roomData.isFinished) {
        io.to(roomId).emit("game:finished");

        return callback?.({
          code: 0,
          data: {
            gameFinished: true,
          },
        });
      }

      io.to(roomId).emit("client:start-next-round", {
        currentColorIndex: roomData.currentColorIndex,
        currentColor: roomData.gameStages[roomData.currentColorIndex],
      });

      callback?.({
        code: 0,
      });
    } catch (error) {
      console.error(error);

      callback?.({
        code: 1,
        message: "Something went wrong.",
      });
    }
  });

  socket.on("game:start", async ({ roomId }, callback) => {
    try {
      const totalColoredStages = appConfig.totalColoredStages;
      const whiteColorPercentage = appConfig.whiteColorPercentage;

      if (!Number.isFinite(totalColoredStages) || totalColoredStages < 2) {
        return callback({
          code: 1,
          message: "Invalid total colored stages configuration",
        });
      }

      if (
        !Number.isFinite(whiteColorPercentage) ||
        whiteColorPercentage < 0 ||
        whiteColorPercentage > 100
      ) {
        return callback({
          code: 1,
          message: "White color percentage must be between 0 and 100",
        });
      }

      const totalWhiteStages = Math.round(
        totalColoredStages * (whiteColorPercentage / 100),
      );

      const totalStages = totalColoredStages + totalWhiteStages;

      /*
       * YELLOW and WHITE are excluded because they are placed separately.
       *
       * YELLOW:
       * - Must appear exactly once.
       * - Must appear after half of the game.
       * - Cannot be the final stage.
       *
       * WHITE:
       * - Uses a percentage-based count.
       * - Cannot appear in the first three rounds.
       * - Cannot appear in the final round.
       */
      const availableColors = [BLUE, GREEN, PURPLE, RED];

      /*
       * Internal placeholder only.
       * It is replaced later with BLUE, GREEN, PURPLE, or RED.
       */
      const PENDING_COLOR = "pending-color";

      const getRandomItem = (items) => {
        return items[Math.floor(Math.random() * items.length)];
      };

      const shuffle = (items) => {
        const shuffledItems = [...items];

        for (let index = shuffledItems.length - 1; index > 0; index--) {
          const randomIndex = Math.floor(Math.random() * (index + 1));

          [shuffledItems[index], shuffledItems[randomIndex]] = [
            shuffledItems[randomIndex],
            shuffledItems[index],
          ];
        }

        return shuffledItems;
      };

      const hasThreeConsecutiveValues = (stages, index, value) => {
        return (
          index >= 2 &&
          stages[index - 1] === value &&
          stages[index - 2] === value
        );
      };

      /*
       * Yellow must appear after half of the complete game
       * and before the final stage.
       *
       * Example:
       * totalStages = 18
       * valid yellow indexes = 9 through 16
       * valid yellow rounds = 10 through 17
       */
      const minimumYellowIndex = Math.floor(totalStages / 2);
      const maximumYellowIndex = totalStages - 2;

      if (minimumYellowIndex > maximumYellowIndex) {
        return callback({
          code: 1,
          message: "The configured stage count is too small",
        });
      }

      const yellowIndex =
        Math.floor(
          Math.random() * (maximumYellowIndex - minimumYellowIndex + 1),
        ) + minimumYellowIndex;

      const stages = Array(totalStages).fill(null);

      stages[yellowIndex] = YELLOW;

      /*
       * Recursively places the exact number of white stages.
       *
       * Each empty position can become:
       * - WHITE
       * - PENDING_COLOR
       *
       * Backtracking is used so invalid placements can be undone.
       */
      const placeWhiteStages = (currentIndex, remainingWhiteStages) => {
        if (currentIndex === totalStages) {
          return remainingWhiteStages === 0;
        }

        /*
         * Yellow was already placed, so skip its position.
         */
        if (stages[currentIndex] === YELLOW) {
          return placeWhiteStages(currentIndex + 1, remainingWhiteStages);
        }

        const availableEmptyPositions = stages
          .slice(currentIndex)
          .filter((stage) => stage === null).length;

        /*
         * Stop this attempt if there are not enough empty positions
         * remaining to place all required white stages.
         */
        if (remainingWhiteStages > availableEmptyPositions) {
          return false;
        }

        /*
         * Randomize whether this position first tries WHITE
         * or a normal colored stage.
         */
        const options = shuffle([WHITE, PENDING_COLOR]);

        for (const option of options) {
          if (option === WHITE) {
            if (remainingWhiteStages === 0) {
              continue;
            }

            /*
             * White cannot appear in rounds 1, 2, or 3.
             */
            if (currentIndex < 3) {
              continue;
            }

            /*
             * White cannot be the final round.
             */
            if (currentIndex === totalStages - 1) {
              continue;
            }

            /*
             * White cannot appear three times consecutively.
             */
            if (hasThreeConsecutiveValues(stages, currentIndex, WHITE)) {
              continue;
            }

            stages[currentIndex] = WHITE;

            const wasPlaced = placeWhiteStages(
              currentIndex + 1,
              remainingWhiteStages - 1,
            );

            if (wasPlaced) {
              return true;
            }

            /*
             * Undo the placement and try another option.
             */
            stages[currentIndex] = null;
          } else {
            const emptyPositionsAfterCurrent = stages
              .slice(currentIndex + 1)
              .filter((stage) => stage === null).length;

            /*
             * Do not reserve this position for a color when all
             * remaining positions are required for white stages.
             */
            if (remainingWhiteStages > emptyPositionsAfterCurrent) {
              continue;
            }

            stages[currentIndex] = PENDING_COLOR;

            const wasPlaced = placeWhiteStages(
              currentIndex + 1,
              remainingWhiteStages,
            );

            if (wasPlaced) {
              return true;
            }

            /*
             * Undo the placement and try another option.
             */
            stages[currentIndex] = null;
          }
        }

        return false;
      };

      const whiteStagesPlaced = placeWhiteStages(0, totalWhiteStages);

      if (!whiteStagesPlaced) {
        return callback({
          code: 1,
          message:
            "Unable to generate stages using the configured white percentage",
        });
      }

      /*
       * Replace every PENDING_COLOR placeholder with a random
       * normal color.
       */
      for (let index = 0; index < stages.length; index++) {
        if (stages[index] !== PENDING_COLOR) {
          continue;
        }

        const allowedColors = availableColors.filter(
          (color) => !hasThreeConsecutiveValues(stages, index, color),
        );

        if (allowedColors.length === 0) {
          return callback({
            code: 1,
            message: "Unable to select a valid color for one of the stages",
          });
        }

        stages[index] = getRandomItem(allowedColors);
      }
      const roomData = await getRoomData({ roomId });
      roomData.gameStages = stages;
      await saveRoomData({ roomId, roomData });
      callback({
        code: 0,
      });
    } catch (error) {
      console.error("game:start error:", error);

      callback({
        code: 1,
        message: "Something went wrong while starting the game",
      });
    }
  });

  socket.on("game:screen-clicked", async ({ playerId, roomId }, callback) => {
    try {
      if (!roomId || !playerId) {
        return callback({
          code: 1,
          message: "roomId and playerId are required",
        });
      }

      const roomData = await getRoomData({ roomId });

      if (!roomData) {
        return callback({
          code: 1,
          message: "Room not found",
        });
      }

      /*
       * Adjust this validation according to your player model.
       */
      const playerExists = roomData.players.some(
        (player) => player.playerId === playerId,
      );

      if (!playerExists) {
        return callback({
          code: 1,
          message: "Player does not belong to this room",
        });
      }

      /*
       * Initialize the list when starting a new click round.
       *
       * This array stores players from fastest to slowest.
       */
      if (!Array.isArray(roomData.playersClickOrder)) {
        roomData.playersClickOrder = [];
      }

      /*
       * Prevent the same player from clicking more than once.
       */
      const alreadyClicked = roomData.playersClickOrder.some(
        (item) => item.playerId === playerId,
      );

      if (alreadyClicked) {
        return callback({
          code: 0,
          message: "Player click already registered",
        });
      }

      /*
       * push() preserves the order in which events reach the server.
       *
       * The first player is at index 0.
       * The second player is at index 1.
       * And so on.
       */
      roomData.playersClickOrder.push({
        playerId,
        position: roomData.playersClickOrder.length + 1,
      });

      const allPlayersClicked =
        roomData.playersClickOrder.length === roomData.players.length;

      await saveRoomData({ roomId, roomData });

      /*
       * When everyone has clicked, the round can continue immediately.
       */
      if (allPlayersClicked) {
        io.to(roomId).emit("game:screen-clicks-completed", {
          list: roomData.playersClickOrder,
        });
      }

      return callback?.({
        code: 0,
      });
    } catch (error) {
      console.error("game:screen-clicked error:", error);

      return callback({
        code: 1,
        message: "Something went wrong while registering the click",
      });
    }
  });

  socket.on(
    "game:screen-click-timeout",
    async ({ playerId, roomId }, callback) => {
      try {
        if (!roomId || !playerId) {
          return callback?.({
            code: 1,
            message: "roomId and playerId are required",
          });
        }

        const roomData = await getRoomData({ roomId });

        if (!roomData) {
          return callback?.({
            code: 1,
            message: "Room not found",
          });
        }

        if (!Array.isArray(roomData.playersClickOrder)) {
          roomData.playersClickOrder = [];
        }

        const registeredPlayerIds = new Set(
          roomData.playersClickOrder.map((item) => item.playerId),
        );

        const missingPlayers = roomData.players.filter(
          (player) => !registeredPlayerIds.has(player.playerId),
        );

        for (const player of missingPlayers) {
          roomData.playersClickOrder.push({
            playerId: player.playerId,
          });
        }

        await saveRoomData(roomId, roomData);

        io.to(roomId).emit("game:screen-clicks-completed", {
          list: roomData.playersClickOrder,
        });

        return callback?.({
          code: 0,
          message: "Missing players added successfully",
          data: {
            playersClickOrder: roomData.playersClickOrder,
          },
        });
      } catch (error) {
        console.error("game:screen-click-timeout error:", error);

        return callback?.({
          code: 1,
          message: "Something went wrong while completing the click order",
        });
      }
    },
  );

  socket.on("game:next-round", (payload, callback) => {
    // Requests moving the game to the next round.
  });

  socket.on("game:answer", (payload, callback) => {
    // submtting an answer for the current round.
  });

  socket.on("game:finish", (payload, callback) => {
    // Ends the current game.
  });
}
