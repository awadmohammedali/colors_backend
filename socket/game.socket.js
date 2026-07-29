import { getRoomData, saveRoomData } from "./repository.js";

export default function initializeGameSocket({ io, socket }) {
  socket.on("game:start", (payload, callback) => {
    // Starts the game. Only the host can trigger this.
  });

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
