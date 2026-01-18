import { defineReactiveFunction } from '@agelum/backend'
import { z } from 'zod'
import { eq } from 'drizzle-orm'

// Get all projects
export const getAllProjects = defineReactiveFunction({
  name: 'projects.getAll',
  input: z.object({
    status: z.enum(['PRE_SALE', 'IN_CONSTRUCTION', 'COMPLETED']).optional(),
  }),
  dependencies: ['project'],
  handler: async (input, db) => {
    const { projects } = db.db._.schema!

    if (input.status) {
      return db.db.query.projects.findMany({
        where: (projects, { eq }) => eq(projects.status, input.status!),
      })
    }

    return db.db.query.projects.findMany()
  },
})

// Get project by ID
export const getProjectById = defineReactiveFunction({
  name: 'projects.getById',
  input: z.object({
    id: z.string(),
  }),
  dependencies: ['project'],
  handler: async (input, db) => {
    return db.db.query.projects.findFirst({
      where: (projects, { eq }) => eq(projects.id, input.id),
    })
  },
})

// Get dashboard projects
export const getAllDashboardProjects = defineReactiveFunction({
  name: 'projects.dashboard.getAll',
  input: z.object({}),
  dependencies: ['project'],
  handler: async (input, db) => {
    return db.db.query.projects.findMany()
  },
})

// Get all units for a project
export const getAllUnits = defineReactiveFunction({
  name: 'projects.units.getAll',
  input: z.object({
    projectId: z.string(),
  }),
  dependencies: ['project_unit'],
  handler: async (input, db) => {
    return db.db.query.projectUnits.findMany({
      where: (units, { eq }) => eq(units.projectId, input.projectId),
      orderBy: (units, { asc }) => [asc(units.queueOrder)],
    })
  },
})

// Get all stories for a project
export const getAllStories = defineReactiveFunction({
  name: 'projects.stories.getAll',
  input: z.object({
    projectId: z.string(),
  }),
  dependencies: ['project_story'],
  handler: async (input, db) => {
    return db.db.query.projectStories.findMany({
      where: (stories, { eq }) => eq(stories.projectId, input.projectId),
    })
  },
})

// Get all stages for a project
export const getAllStages = defineReactiveFunction({
  name: 'projects.stages.getAll',
  input: z.object({
    projectId: z.string(),
  }),
  dependencies: ['project_stage'],
  handler: async (input, db) => {
    return db.db.query.projectStages.findMany({
      where: (stages, { eq }) => eq(stages.projectId, input.projectId),
    })
  },
})

// Get all purchase options for a project
export const getAllPurchaseOptions = defineReactiveFunction({
  name: 'projects.purchaseOptions.getAll',
  input: z.object({
    projectId: z.string(),
  }),
  dependencies: ['project_purchase_option'],
  handler: async (input, db) => {
    return db.db.query.projectPurchaseOptions.findMany({
      where: (options, { eq }) => eq(options.projectId, input.projectId),
    })
  },
})
