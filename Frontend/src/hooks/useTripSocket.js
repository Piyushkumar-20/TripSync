import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/context/SocketContext";

export const useTripSocket = (tripId) => {
  const { socket } = useSocket();
  const qc = useQueryClient();

  useEffect(() => {
    if (!socket || !tripId) return;

    const rejoin = () => {
      socket.emit("join-trip", tripId);
    };

    rejoin();
    socket.on("connect", rejoin);

    const invalidateTrip         = () => qc.invalidateQueries({ queryKey: ["trips"] });
    const invalidateExpenses = () => {
      qc.invalidateQueries({ queryKey: ["expenses", tripId] });
      qc.invalidateQueries({ queryKey: ["expenses-balances", tripId] });
    };
    const invalidateDestinations = () => qc.invalidateQueries({ queryKey: ["destinations", tripId] });
    const invalidateActivities   = () => qc.invalidateQueries({ queryKey: ["activities", tripId] });
    const invalidateMembers      = () => qc.invalidateQueries({ queryKey: ["members", tripId] });
    const invalidateDocuments    = () => qc.invalidateQueries({ queryKey: ["documents", tripId] });
    const invalidateSharedChecklist = () =>
      qc.invalidateQueries({ queryKey: ["checklists", tripId, "Shared"] });

    socket.on("trip:updated",        invalidateTrip);
    socket.on("expense:created",     invalidateExpenses);
    socket.on("expense:updated",     invalidateExpenses);
    socket.on("expense:deleted",     invalidateExpenses);
    socket.on("destination:created", invalidateDestinations);
    socket.on("destination:updated", invalidateDestinations);
    socket.on("destination:deleted", invalidateDestinations);
    socket.on("activity:created",    invalidateActivities);
    socket.on("activity:updated",    invalidateActivities);
    socket.on("activity:deleted",    invalidateActivities);
    socket.on("activity:orderUpdated", invalidateActivities);
    socket.on("member:added",        invalidateMembers);
    socket.on("member:updated",      invalidateMembers);
    socket.on("member:deleted",      invalidateMembers);
    socket.on("document:uploaded",   invalidateDocuments);
    socket.on("document:deleted",    invalidateDocuments);
    socket.on("checklist:itemCreated", invalidateSharedChecklist);
    socket.on("checklist:itemUpdated", invalidateSharedChecklist);
    socket.on("checklist:itemDeleted", invalidateSharedChecklist);

    return () => {
      socket.off("connect",            rejoin);
      socket.off("trip:updated",       invalidateTrip);
      socket.off("expense:created",    invalidateExpenses);
      socket.off("expense:updated",    invalidateExpenses);
      socket.off("expense:deleted",    invalidateExpenses);
      socket.off("destination:created", invalidateDestinations);
      socket.off("destination:updated", invalidateDestinations);
      socket.off("destination:deleted", invalidateDestinations);
      socket.off("activity:created",   invalidateActivities);
      socket.off("activity:updated",   invalidateActivities);
      socket.off("activity:deleted",   invalidateActivities);
      socket.off("activity:orderUpdated", invalidateActivities);
      socket.off("member:added",       invalidateMembers);
      socket.off("member:updated",     invalidateMembers);
      socket.off("member:deleted",     invalidateMembers);
      socket.off("document:uploaded",  invalidateDocuments);
      socket.off("document:deleted",   invalidateDocuments);
      socket.off("checklist:itemCreated", invalidateSharedChecklist);
      socket.off("checklist:itemUpdated", invalidateSharedChecklist);
      socket.off("checklist:itemDeleted", invalidateSharedChecklist);
    };
  }, [socket, tripId, qc]);
};
