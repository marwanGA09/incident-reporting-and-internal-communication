'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getBadgeVariantForStatus } from '@/lib/getBadgeVariantForStatus';

interface IncidentCardProps {
  title: string;
  status: string;
  reporter: string;
  department: string;
  createdAt: Date;
}

export function IncidentCard({
  title,
  status,
  reporter,
  department,
  createdAt,
}: IncidentCardProps) {
  const badgeVariant = getBadgeVariantForStatus(status);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant={badgeVariant}>{status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Reported by {reporter}
          </p>
          <p className="text-sm text-muted-foreground">
            Department: {department}
          </p>
          <p className="text-sm text-muted-foreground">
            Created: {createdAt.toLocaleDateString()}
          </p>
          <Button variant="outline" className="mt-2">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}