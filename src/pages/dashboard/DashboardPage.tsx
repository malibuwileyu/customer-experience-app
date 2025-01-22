import { Button } from '../../components/common/button';
import { Input } from '../../components/common/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common/card';
import { FormInput } from '../../components/common/form-input';
import { FormSelect } from '../../components/common/form-select';
import { FormTextarea } from '../../components/common/form-textarea';
import { Spinner } from '../../components/common/spinner';
import { Skeleton } from '../../components/common/skeleton';
import { LoadingOverlay } from '../../components/common/loading-overlay';
import { ErrorBoundary } from '../../components/common/error-boundary';
import { BuggyCounter } from '../../components/common/buggy-counter';
import { Dialog, DialogContent, DialogTrigger } from '../../components/common/dialog';
import { CreateTicketForm } from '../../components/tickets/create-ticket-form';
import { useState } from 'react';

export function DashboardPage() {
  const [showForms, setShowForms] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.group('Dashboard Error Handler')
    console.error('Error caught:', error.message)
    console.error('Component stack:', errorInfo.componentStack)
    console.groupEnd()
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-4xl font-bold">Welcome to Customer Experience</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Create Ticket</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <CreateTicketForm />
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="w-full">View Knowledge Base</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search</CardTitle>
            <CardDescription>Find tickets or articles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Search..." />
            <Button variant="secondary" className="w-full">Search</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full">View All Activity</Button>
          </CardFooter>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button 
          onClick={() => setShowForms(!showForms)}
          variant="outline"
        >
          {showForms ? "Hide Form Components" : "Show Form Components"}
        </Button>

        <Button 
          onClick={() => setShowLoading(!showLoading)}
          variant="outline"
        >
          {showLoading ? "Hide Loading Components" : "Show Loading Components"}
        </Button>

        <Button 
          onClick={() => setShowError(!showError)}
          variant="outline"
        >
          {showError ? "Hide Error Components" : "Show Error Components"}
        </Button>
      </div>

      {showForms && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Components</CardTitle>
              <CardDescription>Examples of available form components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormInput
                name="title"
                label="Title"
                placeholder="Brief summary of the issue"
                description="A clear and concise title helps us understand your issue quickly."
              />

              <FormInput
                name="description"
                label="Description"
                placeholder="Detailed description of the issue"
                required
                error="Description is required"
              />

              <FormSelect
                name="priority"
                label="Priority"
                description="Select the priority level for this ticket"
                options={[
                  { label: "Select priority...", value: "", disabled: true },
                  { label: "Low", value: "low" },
                  { label: "Medium", value: "medium" },
                  { label: "High", value: "high" },
                  { label: "Urgent", value: "urgent" }
                ]}
              />

              <FormTextarea
                name="notes"
                label="Internal Notes"
                placeholder="Add any internal notes about this ticket"
                description="These notes are only visible to support staff"
                rows={4}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {showLoading && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Loading Components</CardTitle>
              <CardDescription>Examples of available loading states</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Spinners</h3>
                <div className="flex items-center gap-4">
                  <Spinner size="sm" />
                  <Spinner />
                  <Spinner size="lg" />
                  <Spinner variant="secondary" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Skeletons</h3>
                <div className="space-y-4">
                  <Skeleton variant="title" />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" className="w-3/4" />
                  <Skeleton variant="card" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Loading Overlay</h3>
                <div className="space-y-4">
                  <Button onClick={handleLoadingDemo}>
                    Toggle Loading Overlay
                  </Button>
                  <LoadingOverlay isLoading={isLoading}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Content Example</CardTitle>
                        <CardDescription>This content will be blurred when loading</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Click the button above to see the loading overlay in action.
                          The content will be blurred and a spinner will appear.
                        </p>
                      </CardContent>
                    </Card>
                  </LoadingOverlay>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showError && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Boundary Demo</CardTitle>
              <CardDescription>Example of error handling with Error Boundaries</CardDescription>
            </CardHeader>
            <CardContent>
              <ErrorBoundary
                description="This is a demo of how error boundaries catch and handle React errors"
                onError={handleError}
                onReset={() => console.log('Error boundary was reset')}
              >
                <BuggyCounter />
              </ErrorBoundary>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 