/**
 * @fileoverview Dialog component for creating and editing teams
 * @module components/teams/TeamDialog
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
import { Input } from "../../components/common/input"
import { Textarea } from "../../components/common/textarea"
import { useToast } from "../../hooks/use-toast"
import { Team } from "../../types/models/team.types"
import { teamService } from "../../services/team.service"
import { useUsers } from "../../hooks/users/use-users"
import type { ControllerRenderProps } from "react-hook-form"
import { roleManagementService } from "../../services/role-management.service"
import { supabaseService } from "../../lib/supabase"

// Form schema
const teamFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  lead_id: z.string().min(1, "Please select a team lead"),
})

type TeamFormValues = z.infer<typeof teamFormSchema>

interface TeamDialogProps {
  team?: Team
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

export function TeamDialog({ team, onSuccess, trigger }: TeamDialogProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { users } = useUsers()
  const [existingLeads, setExistingLeads] = useState<string[]>([])
  
  // Load existing team leads when dialog opens
  useEffect(() => {
    if (open) {
      const loadExistingLeads = async () => {
        try {
          const { data: teams, error } = await supabaseService
            .from("teams")
            .select("lead_id");
          
          if (error) throw error;
          
          // Get unique lead IDs, ensuring type safety
          const leadIds = [...new Set((teams || []).map(team => team.lead_id))];
          setExistingLeads(leadIds);
        } catch (error) {
          console.error("Failed to load existing team leads:", error);
          toast.error("Failed to load team leads");
        }
      };
      
      loadExistingLeads();
    }
  }, [open, toast]);
  
  // Filter users to only show eligible leads (agents and admins who aren't already leading teams)
  const eligibleLeads = users.filter(user => {
    const role = (user.role || '').toLowerCase();
    const isEligibleRole = ['agent', 'admin', 'super_admin'].includes(role);
    const isNotLeading = !existingLeads.includes(user.id) || (team && user.id === team.lead_id);
    return isEligibleRole && isNotLeading;
  });
  
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: team?.name || "",
      description: team?.description || "",
      lead_id: team?.lead_id || "",
    },
  })

  const onSubmit = async (values: TeamFormValues) => {
    try {
      if (team) {
        await teamService.updateTeam(team.id, values)
        toast.success("Team updated successfully")
        setOpen(false)
        onSuccess?.()
      } else {
        // Create team with lead_id
        const createdTeam = await teamService.createTeam(values)
        
        // Add team lead as a member with team_lead role
        await teamService.addTeamMember({
          team_id: createdTeam.id,
          user_id: values.lead_id,
          role: 'team_lead'
        })

        // Get the selected user's current role
        const selectedUser = eligibleLeads.find(user => user.id === values.lead_id)
        
        // If the user is an agent, update their role to team_lead
        if (selectedUser?.role === 'agent') {
          await roleManagementService.assignRole({
            userId: values.lead_id,
            role: 'team_lead',
            performedBy: values.lead_id // The change is performed by the system on behalf of the user
          })
        }
        
        toast.success("Team created successfully")
      }
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      // Show specific error message if available
      const errorMessage = error instanceof Error ? error.message : "Failed to save team. Please try again."
      toast.error(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant={team ? "outline" : "default"}>
            {team ? "Edit Team" : "Create Team"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{team ? "Edit Team" : "Create Team"}</DialogTitle>
          <DialogDescription>
            {team
              ? "Make changes to your team here. Click save when you're done."
              : "Create a new team by filling out the information below."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: ControllerRenderProps<TeamFormValues, "name"> }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter team name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }: { field: ControllerRenderProps<TeamFormValues, "description"> }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter team description"
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lead_id"
              render={({ field }: FieldProps) => (
                <FormItem>
                  <FormLabel>Team Lead</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team lead" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eligibleLeads.map((user) => (
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
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {team ? "Save Changes" : "Create Team"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 