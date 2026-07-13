import { useState } from "react";
import { format } from "date-fns";
import { MessageSquare, Send } from "lucide-react";
import { useCreateTripComment, useTripComments } from "@/hooks/useComments";
import EmptyState from "@/components/shared/EmptyState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const MAX_COMMENT_LENGTH = 1000;

function initialsFor(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";
}

function formatTimestamp(value) {
  if (!value) return "";
  return format(new Date(value), "MMM d, yyyy, h:mm a");
}

function CommentRow({ comment }) {
  const user = comment.userId;
  const name = user?.fullName ?? "Trip member";

  return (
    <div className="flex gap-3 px-5 py-4">
      <Avatar className="mt-0.5 size-9 shrink-0">
        <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
          {initialsFor(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="text-sm font-semibold">{name}</p>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(comment.updatedAt ?? comment.createdAt)}
          </span>
        </div>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

function CommentSkeletons() {
  return (
    <div className="space-y-px p-5">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex gap-3 py-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TripComments({ tripId }) {
  const [content, setContent] = useState("");
  const { data: comments = [], isLoading } = useTripComments(tripId);
  const createComment = useCreateTripComment(tripId);

  const value = content.trim();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!value || createComment.isPending) return;

    createComment.mutate(value, {
      onSuccess: () => setContent(""),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Comments</CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Keep trip discussions visible to everyone on this trip.
        </p>
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        <div className="min-h-[320px]">
          {isLoading ? (
            <CommentSkeletons />
          ) : comments.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center px-5 py-10">
              <EmptyState
                icon={MessageSquare}
                title="No comments yet"
                description="Start the conversation for this trip."
              />
            </div>
          ) : (
            <div className="max-h-[520px] divide-y overflow-y-auto">
              {comments.map((comment) => (
                <CommentRow key={comment._id} comment={comment} />
              ))}
            </div>
          )}
        </div>

        <Separator />

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 sm:flex-row">
          <Textarea
            value={content}
            maxLength={MAX_COMMENT_LENGTH}
            placeholder="Write a comment..."
            onChange={(event) => setContent(event.target.value)}
            className="min-h-20 resize-none sm:min-h-11"
          />
          <Button
            type="submit"
            className="shrink-0 sm:self-end"
            disabled={!value || createComment.isPending}
          >
            <Send className="h-4 w-4" />
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
