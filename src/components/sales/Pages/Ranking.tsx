
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, CircleDollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SalesRanking() {
  const salesReps = [
    { name: "Sarah Johnson", revenue: 185420, deals: 24, avatar: "", initials: "SJ", rank: 1 },
    { name: "Michael Chen", revenue: 162840, deals: 21, avatar: "", initials: "MC", rank: 2 },
    { name: "Emily Williams", revenue: 142650, deals: 19, avatar: "", initials: "EW", rank: 3 },
    { name: "David Rodriguez", revenue: 126300, deals: 17, avatar: "", initials: "DR", rank: 4 },
    { name: "Lisa Thompson", revenue: 118200, deals: 16, avatar: "", initials: "LT", rank: 5 },
    { name: "Robert Kim", revenue: 105600, deals: 15, avatar: "", initials: "RK", rank: 6 }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Sales Ranking</h2>
        <p className="text-muted-foreground">Sales team performance leaderboard</p>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList className="mb-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="deals">Deals Closed</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-gold-500" />
                Top Performers by Revenue
              </CardTitle>
              <CardDescription>Sales representatives ranked by total revenue generated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesReps.map((rep) => (
                  <div key={rep.name} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground font-medium">
                        {rep.rank}
                      </div>
                      <Avatar className="h-10 w-10 border-2 border-background">
                        <AvatarFallback className="bg-gold-100 text-gold-800">{rep.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{rep.name}</p>
                        <p className="text-sm text-muted-foreground">{rep.deals} deals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gold-600">{formatCurrency(rep.revenue)}</div>
                      {rep.rank <= 3 && (
                        <div className="flex items-center justify-end gap-1 text-muted-foreground text-sm">
                          <Medal className="h-3 w-3" />
                          {rep.rank === 1 ? "Gold" : rep.rank === 2 ? "Silver" : "Bronze"}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="deals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CircleDollarSign className="mr-2 h-5 w-5 text-gold-500" />
                Top Performers by Deals
              </CardTitle>
              <CardDescription>Sales representatives ranked by number of deals closed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...salesReps].sort((a, b) => b.deals - a.deals).map((rep, index) => (
                  <div key={rep.name} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground font-medium">
                        {index + 1}
                      </div>
                      <Avatar className="h-10 w-10 border-2 border-background">
                        <AvatarFallback className="bg-gold-100 text-gold-800">{rep.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{rep.name}</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(rep.revenue)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gold-600">{rep.deals} deals</div>
                      {index <= 2 && (
                        <div className="flex items-center justify-end gap-1 text-muted-foreground text-sm">
                          <Medal className="h-3 w-3" />
                          {index === 0 ? "Gold" : index === 1 ? "Silver" : "Bronze"}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
