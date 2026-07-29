export default function registerPurpleSocketHandlers({ io, socket }) {
  socket.on("game:start", async ({ roomId, playerId }, callback) => {});
}
