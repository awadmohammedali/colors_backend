export default function registerGreenSocketHandlers({ io, socket }) {
  socket.on("game:start", async ({ roomId, playerId }, callback) => {});
}
