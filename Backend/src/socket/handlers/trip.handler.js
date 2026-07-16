export const tripHandler = (io, socket) => {
  socket.on("join-trip", (tripId) => {
    socket.join(`trip_${tripId}`);
  });

  socket.on("leave-trip", (tripId) => {
    socket.leave(`trip_${tripId}`);
  });
};
