export default function registerYellowSocketHandlers({ io, socket }) {
  socket.on("game:start", async ({ roomId, playerId }, callback) => {});
}
