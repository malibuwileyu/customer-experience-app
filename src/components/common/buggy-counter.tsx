import * as React from "react"
import { Button } from "./button"
import { useToast } from "../../hooks/use-toast"

export function BuggyCounter() {
  const { toast } = useToast()
  const [count, setCount] = React.useState(0)

  const handleIncrement = () => {
    const newCount = count + 1
    
    if (newCount === 5) {
      toast.warning("Counter is about to throw an error!", {
        description: "This demonstrates how error boundaries catch and handle React errors",
        duration: 2000,
      })
      
      // Use setTimeout to allow the toast to be shown before throwing the error
      setTimeout(() => {
        throw new Error("Counter reached 5! This is a demo error.")
      }, 2000)
      return
    }
    
    setCount(newCount)
  }

  React.useEffect(() => {
    console.log('BuggyCounter rendered with count:', count)
  }, [count])

  return (
    <div className="space-y-4">
      <p className="text-lg">
        Current count: <span className="font-bold">{count}</span>
      </p>
      <p className="text-sm text-muted-foreground">
        This counter will throw an error when it reaches 5
      </p>
      <Button onClick={handleIncrement}>
        Increment Counter
      </Button>
    </div>
  )
} 