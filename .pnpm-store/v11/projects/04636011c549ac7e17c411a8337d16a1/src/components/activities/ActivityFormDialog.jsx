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
import { useCreateActivity, useUpdateActivity } from "@/hooks/useActivities";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

function to12h(time24) {
  if (!time24) return { hour: "10", minute: "00", period: "AM" };
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = String(h % 12 || 12).padStart(2, "0");
  const minute = String(m).padStart(2, "0");
  return { hour, minute: MINUTES.includes(minute) ? minute : "00", period };
}

function to24h(hour, minute, period) {
  let h = parseInt(hour, 10);
  if (period === "AM" && h === 12) h = 0;
  if (period === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${minute}`;
}

function TimePicker({ label, hour, minute, period, onHour, onMinute, onPeriod }) {
  const selectCls = "flex h-9 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-1">
        <select className={selectCls} value={hour} onChange={(e) => onHour(e.target.value)}>
          {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
        </select>
        <span className="text-sm font-medium text-muted-foreground">:</span>
        <select className={selectCls} value={minute} onChange={(e) => onMinute(e.target.value)}>
          {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className={cn(selectCls, "font-medium")} value={period} onChange={(e) => onPeriod(e.target.value)}>
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
}

export default function ActivityFormDialog({
  open,
  onClose,
  tripId,
  destinationId,
  activity,
}) {
  const isEdit = !!activity;
  const [visitDate, setVisitDate] = useState(null);
  const [start, setStart] = useState(to12h());
  const [end, setEnd] = useState({ hour: "11", minute: "00", period: "AM" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const createActivity = useCreateActivity(tripId, destinationId, onClose);
  const updateActivity = useUpdateActivity(tripId, destinationId, onClose);
  const isPending = createActivity.isPending || updateActivity.isPending;

  useEffect(() => {
    if (!open) return;

    if (activity) {
      reset({
        title: activity.title,
        description: activity.description ?? "",
        estimatedCost: activity.estimatedCost ?? "",
      });
      setVisitDate(activity.visitDate ? new Date(activity.visitDate) : null);
      setStart(to12h(activity.startTime));
      setEnd(to12h(activity.endTime));
      return;
    }

    reset({ title: "", description: "", estimatedCost: "" });
    setVisitDate(null);
    setStart(to12h());
    setEnd({ hour: "11", minute: "00", period: "AM" });
  }, [open, activity, reset]);

  const onSubmit = (values) => {
    if (!visitDate) return;

    const payload = {
      title: values.title.trim(),
      description: values.description?.trim() || "",
      visitDate: visitDate.toISOString(),
      startTime: to24h(start.hour, start.minute, start.period),
      endTime: to24h(end.hour, end.minute, end.period),
      estimatedCost: String(values.estimatedCost).trim(),
    };

    if (isEdit) {
      updateActivity.mutate({
        activityId: activity._id,
        ...payload,
      });
      return;
    }

    createActivity.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Activity" : "Add Activity"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="activity-title">Title</Label>
            <Input
              id="activity-title"
              placeholder="e.g. Museum guided tour"
              {...register("title", {
                required: "Title is required",
                minLength: { value: 5, message: "At least 5 characters" },
                maxLength: { value: 50, message: "At most 50 characters" },
              })}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="activity-description">Description</Label>
            <Textarea
              id="activity-description"
              placeholder="Add notes for this activity"
              rows={3}
              {...register("description", {
                minLength: { value: 10, message: "At least 10 characters" },
                maxLength: { value: 300, message: "At most 300 characters" },
              })}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
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

            <div className="space-y-1.5">
              <Label htmlFor="activity-cost">Estimated Cost</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 select-none text-sm text-muted-foreground">₹</span>
                <Input
                  id="activity-cost"
                  type="number"
                  min={0}
                  className="pl-7"
                  placeholder="e.g. 500"
                  {...register("estimatedCost", {
                    required: "Estimated cost is required",
                    min: { value: 0, message: "Cost cannot be negative" },
                  })}
                />
              </div>
              {errors.estimatedCost && <p className="text-xs text-destructive">{errors.estimatedCost.message}</p>}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <TimePicker
              label="Start Time"
              hour={start.hour}
              minute={start.minute}
              period={start.period}
              onHour={(hour) => setStart((prev) => ({ ...prev, hour }))}
              onMinute={(minute) => setStart((prev) => ({ ...prev, minute }))}
              onPeriod={(period) => setStart((prev) => ({ ...prev, period }))}
            />
            <TimePicker
              label="End Time"
              hour={end.hour}
              minute={end.minute}
              period={end.period}
              onHour={(hour) => setEnd((prev) => ({ ...prev, hour }))}
              onMinute={(minute) => setEnd((prev) => ({ ...prev, minute }))}
              onPeriod={(period) => setEnd((prev) => ({ ...prev, period }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !visitDate}>
              {isPending ? "Saving..." : isEdit ? "Save Changes" : "Add Activity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
