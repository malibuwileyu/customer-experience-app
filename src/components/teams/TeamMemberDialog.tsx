/**
 * @fileoverview Dialog component for managing team members
 * @module components/teams/TeamMemberDialog
 */

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "../../components/common/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/common/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/common/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/common/select"
import { useToast } from "../../hooks/use-toast"
import { Team } from "../../types/models/team.types"
import { teamService } from "../../services/team.service"
import { useUsers } from "../../hooks/users/use-users"
import { TeamRoleSelector } from "./TeamRoleSelector"
import { serviceClient } from "../../lib/supabase"

// Form schema
const memberFormSchema = z.object({
  userId: z.string().min(1, "Please select a user"),
  role: z.enum(["admin", "team_lead", "agent"]),
})

type MemberFormValues = z.infer<typeof memberFormSchema>

interface TeamMemberDialogProps {
  team: Team
  onSuccess?: () => void
  trigger?: React.ReactNode
}

interface FieldProps {
  field: {
    value: string
    onChange: (value: string) => void
    name: string
  }
}

interface TeamData {
  lead_id: string
}

interface User {
  id: string
  name?: string
  email?: string
  role?: string
  full_name?: string
}

export function TeamMemberDialog({ team, onSuccess, trigger }: TeamMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { users, isLoading } = useUsers()
  const [existingLeads, setExistingLeads] = useState<string[]>([])
  
  // Load existing team leads when dialog opens
  useEffect(() => {
    if (open) {
      const loadExistingLeads = async () => {
        try {
          const { data: teams, error } = await serviceClient
            .from("teams")
            .select("lead_id");
          
          if (error) throw error;
          
          // Get unique lead IDs from teams data
          const leadIds = [...new Set((teams as TeamData[] || []).map(t => t.lead_id))];
          setExistingLeads(leadIds);
        } catch (error) {
          console.error("Failed to load existing team leads:", error);
          toast.error("Failed to load team leads");
        }
      };
      
      loadExistingLeads();
    }
  }, [open, toast]);

  // Filter out users who are already team leads and customers
  const availableUsers = users.filter(user => {
    const isNotTeamLead = !existingLeads.includes(user.id);
    const isNotCustomer = user.role !== 'customer';
    return isNotTeamLead && isNotCustomer;
  });

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      role: "agent",
    },
  })

  const onSubmit = async (values: MemberFormValues) => {
    try {
      await teamService.addTeamMember({
        team_id: team.id,
        user_id: values.userId,
        role: values.role,
      })
      toast.success("Member added", {
        description: "The team member has been added successfully."
      })
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      toast.error("Failed to add team member. Please try again.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">Add Member</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Add a new member to the team and assign their role.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }: FieldProps) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]">
                      {availableUsers?.map((user: User) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }: FieldProps) => (
                <TeamRoleSelector
                  value={field.value}
                  onValueChange={field.onChange}
                  name={field.name}
                />
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Add Member
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 