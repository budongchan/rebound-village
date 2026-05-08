import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { agentTables } from './agent/schema';
import { aiTownTables } from './aiTown/schema';
import { conversationId, playerId } from './aiTown/ids';
import { engineTables } from './engine/schema';

export default defineSchema({
  zones: defineTable({
    code: v.string(),
    name: v.string(),
    tag: v.string(),
    color: v.string(),
    iso_x: v.number(),
    iso_y: v.number(),
    iso_w: v.number(),
    iso_h: v.number(),
  }).index('code', ['code']),

  agents: defineTable({
    zone_id: v.id('zones'),
    code: v.string(),
    name: v.string(),
    description: v.string(),
    status: v.union(
      v.literal('idle'),
      v.literal('working'),
      v.literal('error'),
      v.literal('offline'),
    ),
    desk_iso_x: v.number(),
    desk_iso_y: v.number(),
    is_chat_enabled: v.boolean(),
    persona: v.string(),
    current_task_id: v.union(v.id('tasks'), v.null()),
    last_active_at: v.number(),
  })
    .index('zone_id', ['zone_id'])
    .index('code', ['code']),

  players: defineTable({
    auth_user_id: v.string(),
    display_name: v.string(),
    role: v.union(v.literal('ceo'), v.literal('team')),
    current_zone_id: v.union(v.id('zones'), v.null()),
    pos_iso_x: v.number(),
    pos_iso_y: v.number(),
    status: v.union(v.literal('online'), v.literal('idle'), v.literal('offline')),
    avatar_config: v.any(),
    last_seen_at: v.number(),
  })
    .index('auth_user_id', ['auth_user_id'])
    .index('status', ['status']),

  projects: defineTable({
    code: v.string(),
    name: v.string(),
    description: v.string(),
    status: v.union(
      v.literal('planned'),
      v.literal('active'),
      v.literal('paused'),
      v.literal('completed'),
    ),
    owner_zone_id: v.union(v.id('zones'), v.null()),
    created_at: v.number(),
    updated_at: v.number(),
  }).index('code', ['code']),

  tasks: defineTable({
    project_id: v.union(v.id('projects'), v.null()),
    agent_id: v.union(v.id('agents'), v.null()),
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal('todo'),
      v.literal('in_progress'),
      v.literal('blocked'),
      v.literal('done'),
    ),
    priority: v.union(v.literal('low'), v.literal('normal'), v.literal('high'), v.literal('urgent')),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index('project_id', ['project_id'])
    .index('agent_id', ['agent_id'])
    .index('status', ['status']),

  events: defineTable({
    agent_id: v.union(v.id('agents'), v.null()),
    task_id: v.union(v.id('tasks'), v.null()),
    project_id: v.union(v.id('projects'), v.null()),
    event_type: v.union(
      v.literal('started'),
      v.literal('progress'),
      v.literal('completed'),
      v.literal('failed'),
    ),
    message: v.string(),
    metadata: v.any(),
    created_at: v.number(),
  })
    .index('created_at', ['created_at'])
    .index('agent_id', ['agent_id']),

  chat_messages: defineTable({
    from_type: v.union(v.literal('player'), v.literal('agent'), v.literal('system')),
    from_id: v.string(),
    channel: v.union(v.literal('village'), v.literal('dm'), v.literal('agent_chat')),
    to_id: v.union(v.string(), v.null()),
    message: v.string(),
    created_at: v.number(),
  })
    .index('channel_created_at', ['channel', 'created_at'])
    .index('to_id', ['to_id']),

  announcements: defineTable({
    author_id: v.string(),
    title: v.string(),
    body: v.string(),
    priority: v.union(v.literal('normal'), v.literal('important'), v.literal('urgent')),
    starts_at: v.number(),
    ends_at: v.union(v.number(), v.null()),
    created_at: v.number(),
  })
    .index('starts_at', ['starts_at'])
    .index('priority', ['priority']),

  music: defineTable({
    storageId: v.string(),
    type: v.union(v.literal('background'), v.literal('player')),
  }),

  messages: defineTable({
    conversationId,
    messageUuid: v.string(),
    author: playerId,
    text: v.string(),
    worldId: v.optional(v.id('worlds')),
  })
    .index('conversationId', ['worldId', 'conversationId'])
    .index('messageUuid', ['conversationId', 'messageUuid']),

  ...agentTables,
  ...aiTownTables,
  ...engineTables,
});
