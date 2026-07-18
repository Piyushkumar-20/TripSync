import { PlusCircle, Users, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function QuickActions({ onCreateTrip }) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={onCreateTrip}
        >
          <PlusCircle className="h-4 w-4 text-primary" />
          Create New Trip
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => navigate("/trips")}
        >
          <Map className="h-4 w-4 text-primary" />
          View My Trips
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => navigate("/members")}
        >
          <Users className="h-4 w-4 text-primary" />
          Manage Members
        </Button>
      </CardContent>
    </Card>
  );
}
