import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Gift, Heart, Star, Users } from "lucide-react";

export default function GiverPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold text-slate-900">Giver</span>
            </div>
          </div>
          <Link href="/sign-in">
            <Button>Sign In</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Give Back to Your Community
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Support others in the Notion App Builder community. Whether you're sharing 
            templates, providing feedback, or offering help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Share Templates */}
          <Link href="/dashboard">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Gift className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Share Templates</CardTitle>
                <CardDescription>
                  Publish your templates to help others get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Leave Feedback */}
          <Link href="https://github.com/waltermolinabot/notion-app-builder/issues">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Leave Feedback</CardTitle>
                <CardDescription>
                  Help us improve by sharing your thoughts and ideas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Give Feedback
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Rate the App */}
          <Link href="https://github.com/waltermolinabot/notion-app-builder">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <CardTitle>Rate the App</CardTitle>
                <CardDescription>
                  Star us on GitHub and show your support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                  Star on GitHub
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Join Community */}
          <Link href="/dashboard/roles">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Join Community</CardTitle>
                <CardDescription>
                  Connect with other users and collaborate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  View Roles
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* View Docs */}
          <Link href="/#features">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Learn More</CardTitle>
                <CardDescription>
                  Explore features and get started guides
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  View Features
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Contact Support */}
          <Link href="/#pricing">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Get help from our team when you need it
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  View Plans
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
