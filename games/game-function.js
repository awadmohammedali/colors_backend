import { BLUE, WHITE, YELLOW, PURPLE, GREEN } from "../util/constants.js";
import { getAppConfig } from "../config/app-config.js";

export const createRoom = ({ roomId, player }) => {
  const roomData = {
    roomId,

    hostPlayerId: player.id,

    players: [player],

    gameStages: [],
    isFinished: false,
    currentColorIndex: -1,

    playersClickOrder: [],

    gamesSettings: {
      blue: {
        mainPlayerId: "",
        selectedCategories: [
          // categoryId
        ],
        answer: {},
        question: "",
        jockerAnswer: {},
        rightAnswer: {},
        playersAnswers: [
          {},
          // { playerId, answer }
        ],
      },

      red: {},

      yellow: {},

      purple: {},
    },
  };
  return roomData;
};

export const createPlayer = ({ playerId, socketId, name, isAdmin }) => {
  const player = {
    playerId,
    socketId,
    name,
    isAdmin,
    categoriesSelection: [],
    score: 0,
    powers: {
      kingUsed: false,
      jokerUsed: false,
    },
  };
  return player;
};

export const removePlayerFromRoom = ({ roomData, playerId }) => {
  return {
    ...roomData,
    players: roomData.players.filter((player) => player.playerId !== playerId),
  };
};

export const calculateFinalCategories = ({
  players,
  maximumSelectedCategories = 4,
}) => {
  const categoryStatistics = new Map();
  let appearanceOrder = 0;

  for (const player of players) {
    for (const categoryId of player.selectedCategories) {
      if (!categoryStatistics.has(categoryId)) {
        categoryStatistics.set(categoryId, {
          categoryId,
          selectionCount: 0,
          firstAppearanceOrder: appearanceOrder,
        });

        appearanceOrder++;
      }

      categoryStatistics.get(categoryId).selectionCount++;
    }
  }

  const selectedCategories = [...categoryStatistics.values()]
    .sort((firstCategory, secondCategory) => {
      if (secondCategory.selectionCount !== firstCategory.selectionCount) {
        return secondCategory.selectionCount - firstCategory.selectionCount;
      }

      return (
        firstCategory.firstAppearanceOrder - secondCategory.firstAppearanceOrder
      );
    })
    .slice(0, maximumSelectedCategories)
    .map((category) => category.categoryId);

  return selectedCategories;
};

export const calculationBlueColorScore = ({ roomData, answer }) => {
  const appConfig = getAppConfig();
  const blueGameSettings = roomData.gamesSettings.blue;

  if (answer.isCorrect) {
    const mainPlayer = roomData.players.find(
      (player) => playerId === blueGameSettings.mainPlayerId,
    );
    if (!mainPlayer) {
      return;
    }

    mainPlayer.score += appConfig.scoresValue.blueWinner;
  } else {
    const fakeAnswerPlayer = roomData.players.find(
      (player) => answer.playerId === player.playerId,
    );
    if (fakeAnswerPlayer) {
      fakeAnswerPlayer.score += appConfig.scoresValue.blueLoser;
    }
  }
};
