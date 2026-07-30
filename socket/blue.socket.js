import { getRoomData, saveRoomData } from "./repository.js";
import { calculateFinalCategories } from "../games/game-function.js";
import { getQuestion } from "../games/blue/questions-game.js";
import { BLUE } from "../util/constants.js";
export default function registerBlueSocketHandlers({ io, socket }) {
  //-------------------------------------------------------------
  // Blue Game Socket Handlers
  //-------------------------------------------------------------
  socket.on(
    "blue:categories-selected",
    async ({ roomId, playerId, selectedCategoryIds }, callback) => {
      try {
        if (!roomId || !playerId || !Array.isArray(selectedCategoryIds)) {
          return callback?.({
            code: 1,
            error: "Invalid request data",
          });
        }

        const roomData = await getRoomData({ roomId });

        const player = roomData.players.find(
          (player) => player.playerId === playerId,
        );

        if (!player) {
          return callback?.({
            code: 1,
            error: "Player does not belong to this room",
          });
        }

        player.selectedCategories = selectedCategoryIds;

        const allPlayersSubmitted = roomData.players.every(
          (player) =>
            Array.isArray(player.selectedCategories) &&
            player.selectedCategories.length > 0,
        );

        if (allPlayersSubmitted) {
          calculateFinalCategories({
            players: roomData.players,
            maximumSelectedCategories: 4,
          });

          await saveRoomData({ roomData, roomId });

          io.to(roomId).emit("blue:host-category-selected");
        } else {
          await saveRoomData({ roomId, roomData });
        }

        return callback?.({
          code: 0,
        });
      } catch (error) {
        console.error("Failed to save Blue category selections:", error);

        return callback?.({
          code: 1,
          error: "Unable to save category selections",
        });
      }
    },
  );

  socket.on(
    "blue:host-category-selected",
    async ({ roomId, categoryId }, callback) => {
      try {
        const qustion = await getQuestion({
          categoryId,
        });
        const roomData = await getRoomData({ roomId });
        roomData.gamesSettings.blue.question = qustion;
        roomData.gamesSettings.blue.jokerAnswer = qustion.jokerAnswer;
        roomData.gamesSettings.blue.rightAnswer = {
          answer: qustion.answer,
          isCorrect: true,
        };
        await saveRoomData({ roomId, roomData });
        return callback?.({
          code: 0,
        });
      } catch (error) {
        console.error("Failed to start Blue game:", error);
        return callback?.({
          code: 1,
          error: "Unable to start Blue game",
        });
      }
    },
  );

  socket.on("blue:start-game", async ({ roomId }, callback) => {
    try {
      const roomData = await getRoomData({ roomId });
      callback?.({ code: 0, data: roomData.gamesSettings.blue });
    } catch (error) {
      console.error("Failed to start Blue game:", error);
      return callback?.({
        code: 1,
        error: "Unable to start Blue game",
      });
    }
  });

  socket.on(
    "blue:submit-fake-answer",
    async ({ roomId, playerId, answer }, callback) => {
      try {
        if (!roomId || !playerId || !answer?.trim()) {
          return callback?.({
            code: 1,
            error: "Invalid request data",
          });
        }

        const roomData = await getRoomData({ roomId });

        const blueGame = roomData.games.blue;

        if (!blueGame.question) {
          return callback?.({
            code: 1,
            error: "No active Blue question",
          });
        }

        if (blueGame.mainPlayerId === playerId) {
          return callback?.({
            code: 1,
            error: "Main player cannot submit a fake answer",
          });
        }

        const player = roomData.players.find(
          (player) => player.playerId === playerId,
        );

        if (!player) {
          return callback?.({
            code: 1,
            error: "Player does not belong to this room",
          });
        }

        const alreadySubmitted = blueGame.playersAnswers.some(
          (item) => item.playerId === playerId,
        );

        if (alreadySubmitted) {
          return callback?.({
            code: 1,
            error: "Fake answer already submitted",
          });
        }

        blueGame.playersAnswers.push({
          isCorrect: false,
          playerId,
          answer: answer.trim(),
        });

        await saveRoomData({ roomId, roomData });

        callback?.({
          code: 0,
        });

        if (allPlayersSubmitted) {
          io.to(roomId).emit("blue:show-answers");
        }
      } catch (error) {
        console.error("Failed to submit fake answer:", error);

        callback?.({
          code: 1,
          error: "Unable to submit fake answer",
        });
      }
    },
  );

  socket.on(
    "blue:submit-answer",
    async ({ roomId, playerId, answer }, callback) => {
      try {
        if (!roomId || !playerId) {
          return callback?.({
            code: 1,
            error: "Invalid request data",
          });
        }

        const roomData = await getRoomData({ roomId });
        const blueGame = roomData.games.blue;

        if (!blueGame.question) {
          return callback?.({
            code: 1,
            error: "No active Blue question",
          });
        }

        if (blueGame.mainPlayerId !== playerId) {
          return callback?.({
            code: 1,
            error: "Only the main player can submit an answer",
          });
        }

        if (blueGame.answer) {
          return callback?.({
            code: 1,
            error: "Answer already submitted",
          });
        }

        if (!blueGame.answer) {
          return callback?.({
            code: 1,
            error: "Selected answer does not exist",
          });
        }

        const mainPlayer = roomData.mainPlayerId !== playerId;

        if (!mainPlayer) {
          return callback?.({
            code: 1,
            error: "Player does not belong to this room",
          });
        }

        calculationBlueColorScore({ answer, roomData });

        await saveRoomData({ roomId, roomData });

        callback?.({
          code: 0,
        });

        io.to(roomId).emit("game:show-result", {
          game: BLUE,
          players: roomData.players,
        });
      } catch (error) {
        console.error("Failed to submit Blue answer:", error);

        callback?.({
          code: 1,
          error: "Unable to submit answer",
        });
      }
    },
  );
}
