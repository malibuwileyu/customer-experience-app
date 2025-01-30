import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Spinner,
  Skeleton,
  LoadingOverlay,
  ErrorBoundary,
  Dialog,
  DialogContent,
  DialogTrigger
} from '../../components/common'
import { CreateTicketForm } from '../../components/tickets/create-ticket-form'
import { ArticleSearch } from '../../components/kb'

export function DashboardPage() {
  const [showForms, setShowForms] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const form = useForm()

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const handleSearch = (term: string) => {
    // No-op for now since we removed search term state
    console.log('Search term:', term);
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
            <Button variant="outline" className="w-full" asChild>
              <Link to="/app/user-tickets">My Tickets</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/app/kb">View Knowledge Base</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search</CardTitle>
            <CardDescription>Find tickets or articles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="w-full">Search Knowledge Base</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <ArticleSearch 
                  onSearch={handleSearch}
                  onCategoryChange={handleCategoryChange}
                  selectedCategory={selectedCategory}
                />
              </DialogContent>
            </Dialog>
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
              <FormField
                control={form.control}
                name="input"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Input Field</FormLabel>
                    <FormControl>
                      <Input placeholder="Type something..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="select"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Field</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="option1">Option 1</SelectItem>
                        <SelectItem value="option2">Option 2</SelectItem>
                        <SelectItem value="option3">Option 3</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="textarea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Textarea Field</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Type something..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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
              <CardDescription>Examples of loading states</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>

              <div className="relative h-[100px] w-full">
                <LoadingOverlay />
              </div>

              <div className="flex items-center gap-2">
                <Spinner />
                <span>Loading...</span>
              </div>

              <Button onClick={handleLoadingDemo} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    Loading...
                  </>
                ) : (
                  'Click to Load'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {showError && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Components</CardTitle>
              <CardDescription>Examples of error states</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ErrorBoundary>
                <div>Error Boundary Content</div>
              </ErrorBoundary>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 