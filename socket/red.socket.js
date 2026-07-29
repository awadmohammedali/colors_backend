export default function registerRedSocketHandlers({ io, socket }) {
  socket.on("game:start", async ({ roomId, playerId }, callback) => {});
}
