import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useCreateTrip, useUpdateTrip } from "@/hooks/useTrips";

export default function TripFormDialog({ open, onClose, trip }) {
  const isEdit = !!trip;

  const [startDate, setStartDate] = useState(null);
  const [endDate,   setEndDate]   = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const createTrip = useCreateTrip(() => onClose());
  const updateTrip = useUpdateTrip(() => onClose());

  const isPending = createTrip.isPending || updateTrip.isPending;

  useEffect(() => {
    if (open) {
      if (trip) {
        reset({ title: trip.title, description: trip.description ?? "" });
        setStartDate(trip.startDate ? new Date(trip.startDate) : null);
        setEndDate(trip.endDate ? new Date(trip.endDate) : null);
      } else {
        reset({ title: "", description: "" });
        setStartDate(null);
        setEndDate(null);
      }
    }
  }, [open, trip, reset]);

  const onSubmit = (values) => {
    if (!startDate || !endDate) return;
    const payload = {
      title:       values.title.trim(),
      description: values.description?.trim() || "",
      startDate:   startDate.toISOString(),
      endDate:     endDate.toISOString(),
    };

    if (isEdit) {
      updateTrip.mutate({ tripId: trip._id, ...payload });
    } else {
      createTrip.mutate(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Trip" : "Create New Trip"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Summer in Europe"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What's this trip about?"
              rows={3}
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMM d, yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
              {!startDate && <p className="text-xs text-muted-foreground">Required</p>}
            </div>

            <div className="space-y-1.5">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "MMM d, yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(d) => startDate && d < startDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {!endDate && <p className="text-xs text-muted-foreground">Required</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !startDate || !endDate}>
              {isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
