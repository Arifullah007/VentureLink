import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { subscriptionPlans } from "@/lib/data";
import { CheckCircle, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SubscriptionsPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Our Subscription Plans</h1>
        <p className="mt-2 text-lg text-muted-foreground">Choose the right plan to unlock opportunities and connect with innovators.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start justify-center">
        {subscriptionPlans.map((plan) => (
          <Card key={plan.title} className={cn(
            "flex flex-col h-full transition-all",
            plan.isPopular ? "border-primary shadow-2xl scale-105" : "hover:shadow-lg"
          )}>
            {plan.isPopular && (
              <div className="bg-primary text-primary-foreground text-xs font-bold uppercase py-1 px-3 text-center flex items-center justify-center gap-1">
                <Star className="h-3 w-3" /> Most Popular
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.title}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
              <div>
                <div className="mb-6 text-center">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.pricePeriod && <span className="text-muted-foreground">{plan.pricePeriod}</span>}
                </div>
                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button className="w-full mt-8" variant={plan.isPopular ? 'default' : 'secondary'}>
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
