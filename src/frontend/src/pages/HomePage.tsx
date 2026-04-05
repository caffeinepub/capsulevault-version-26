import { Clock, Heart, Lightbulb, Lock } from "lucide-react";
import type { Page } from "../App";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-16 relative">
        <div className="absolute inset-0 -z-10 opacity-30">
          <img
            src="/assets/generated/hero-background.dim_1200x800.png"
            alt=""
            className="w-full h-full object-cover rounded-3xl"
          />
        </div>
        <div className="py-16 px-4">
          <div className="inline-flex items-center gap-2 mb-6">
            <img
              src="/assets/generated/hourglass-icon-transparent.dim_64x64.png"
              alt=""
              className="w-12 h-12"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Send a message to the future.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Create a time-locked capsule that opens on a date you choose.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8"
              onClick={() => onNavigate({ type: "create" })}
            >
              <Lock className="w-5 h-5 mr-2" />
              Create Capsule
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8"
              onClick={() => onNavigate({ type: "open" })}
            >
              <Clock className="w-5 h-5 mr-2" />
              Open Capsule
            </Button>
          </div>
        </div>
      </div>

      {/* Capsule Types */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50"
          onClick={() => onNavigate({ type: "create", capsuleType: "love" })}
        >
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <img
                src="/assets/generated/message-icon-transparent.dim_64x64.png"
                alt=""
                className="w-10 h-10"
              />
              <CardTitle className="text-2xl">Message Capsule</CardTitle>
            </div>
            <CardDescription className="text-base">
              Write something meaningful now. It unlocks later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Choose a category to guide your message
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Pick an unlock date and time
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Share using a private claim code
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50"
          onClick={() =>
            onNavigate({ type: "create", capsuleType: "prediction" })
          }
        >
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <img
                src="/assets/generated/prediction-icon-transparent.dim_64x64.png"
                alt=""
                className="w-10 h-10"
              />
              <CardTitle className="text-2xl">Prediction Capsule</CardTitle>
            </div>
            <CardDescription className="text-base">
              Lock a prediction now. See it later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Choose a prediction type (statement, sports winner, numeric
                goal)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Pick an unlock date and time
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Includes a Commit ID to prove it wasn't changed
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="text-center p-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Time-Locked</h3>
          <p className="text-sm text-muted-foreground">
            Messages unlock only after your chosen date
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <img
              src="/assets/generated/lock-key-icon-transparent.dim_64x64.png"
              alt=""
              className="w-6 h-6"
            />
          </div>
          <h3 className="font-semibold mb-2">Private & Secure</h3>
          <p className="text-sm text-muted-foreground">
            No accounts, no tracking, claim codes only
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Meaningful</h3>
          <p className="text-sm text-muted-foreground">
            Create lasting memories and predictions
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Simple</h3>
          <p className="text-sm text-muted-foreground">
            No registration required, just create and share
          </p>
        </div>
      </div>
    </div>
  );
}
