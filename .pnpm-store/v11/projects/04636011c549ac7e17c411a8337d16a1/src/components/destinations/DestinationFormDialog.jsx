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
import { useCreateDestination, useUpdateDestination } from "@/hooks/useDestinations";

const HOURS   = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

function to12h(time24) {
  if (!time24) return { hour: "10", minute: "00", period: "AM" };
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour   = String(h % 12 || 12).padStart(2, "0");
  const minute = String(m).padStart(2, "0");
  return { hour, minute: MINUTES.includes(minute) ? minute : "00", period };
}

function to24h(hour, minute, period) {
  let h = parseInt(hour, 10);
  if (period === "AM" && h === 12) h = 0;
  if (period === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${minute}`;
}

export default function DestinationFormDialog({ open, onClose, tripId, destination }) {
  const isEdit = !!destination;
  const [visitDate, setVisitDate]   = useState(null);
  const [hour,      setHour]        = useState("10");
  const [minute,    setMinute]      = useState("00");
  const [period,    setPeriod]      = useState("AM");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const createDestination = useCreateDestination(tripId, onClose);
  const updateDestination = useUpdateDestination(tripId, onClose);
  const isPending = createDestination.isPending || updateDestination.isPending;

  useEffect(() => {
    if (open) {
      if (destination) {
        reset({
          name:          destination.name,
          description:   destination.description,
          estimatedCost: destination.estimatedCost,
        });
        setVisitDate(destination.visitDate ? new Date(destination.visitDate) : null);
        const t = to12h(destination.visitTime);
        setHour(t.hour);
        setMinute(t.minute);
        setPeriod(t.period);
      } else {
        reset({ name: "", description: "", estimatedCost: "" });
        setVisitDate(null);
        setHour("10");
        setMinute("00");
        setPeriod("AM");
      }
    }
  }, [open, destination, reset]);

  const onSubmit = (values) => {
    if (!visitDate) return;
    const payload = {
      name:          values.name.trim(),
      description:   values.description.trim(),
      visitDate:     visitDate.toISOString(),
      visitTime:     to24h(hour, minute, period),
      estimatedCost: values.estimatedCost.trim(),
    };
    if (isEdit) {
      updateDestination.mutate({ destinationId: destination._id, ...payload });
    } else {
      createDestination.mutate(payload);
    }
  };

  const selectCls = "flex h-9 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Destination" : "Add Destination"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="dest-name">Name</Label>
            <Input
              id="dest-name"
              placeholder="e.g. Eiffel Tower"
              {...register("name", {
                required: "Name is required",
                minLength: { value: 5, message: "At least 5 characters" },
                maxLength: { value: 50, message: "At most 50 characters" },
              })}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dest-description">Description</Label>
            <Textarea
              id="dest-description"
              placeholder="What's special about this place?"
              rows={3}
              {...register("description", {
                required: "Description is required",
                minLength: { value: 10, message: "At least 10 characters" },
                maxLength: { value: 300, message: "At most 300 characters" },
              })}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Date picker */}
            <div className="space-y-1.5">
              <Label>Visit Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !visitDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {visitDate ? format(visitDate, "MMM d, yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={visitDate} onSelect={setVisitDate} initialFocus />
                </PopoverContent>
              </Popover>
              {!visitDate && <p className="text-xs text-muted-foreground">Required</p>}
            </div>

            {/* Time picker: hour / minute / AM-PM */}
            <div className="space-y-1.5">
              <Label>Visit Time</Label>
              <div className="flex items-center gap-1">
                <select className={selectCls} value={hour} onChange={e => setHour(e.target.value)}>
                  {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="text-muted-foreground text-sm font-medium">:</span>
                <select className={selectCls} value={minute} onChange={e => setMinute(e.target.value)}>
                  {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select className={cn(selectCls, "font-medium")} value={period} onChange={e => setPeriod(e.target.value)}>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Estimated cost with ₹ prefix */}
          <div className="space-y-1.5">
            <Label htmlFor="dest-cost">Estimated Cost</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">₹</span>
              <Input
                id="dest-cost"
                className="pl-7"
                placeholder="e.g. 500 or Free"
                {...register("estimatedCost", { required: "Estimated cost is required" })}
              />
            </div>
            {errors.estimatedCost && <p className="text-xs text-destructive">{errors.estimatedCost.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !visitDate}>
              {isPending ? "Saving..." : isEdit ? "Save Changes" : "Add Destination"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
