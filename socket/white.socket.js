export default function registerWhiteSocketHandlers({ io, socket }) {
  socket.on("game:start", async ({ roomId, playerId }, callback) => {});
}
