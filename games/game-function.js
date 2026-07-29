export const createRoom = ({ roomId, player }) => {
  const roomData = {
    roomId,

    hostPlayerId: player.id,

    players: [player],

    gameStages: [],

    currentColorIndex: 0,

    gamesSettings: {
      blue: {
        selectedCategories: [
          // categoryId
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
