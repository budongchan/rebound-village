import { v } from 'convex/values';
import { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { reboundAgents, reboundPlayers, reboundZones } from '../data/rebound';

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const zoneIds = new Map<string, Id<'zones'>>();

    for (const zone of reboundZones) {
      const existing = await ctx.db
        .query('zones')
        .withIndex('code', (q) => q.eq('code', zone.code))
        .unique();

      const fields = {
        code: zone.code,
        name: zone.name,
        tag: zone.tag,
        color: zone.color,
        iso_x: zone.iso_x,
        iso_y: zone.iso_y,
        iso_w: zone.iso_w,
        iso_h: zone.iso_h,
      };

      if (existing) {
        await ctx.db.patch(existing._id, fields);
        zoneIds.set(zone.code, existing._id);
      } else {
        zoneIds.set(zone.code, await ctx.db.insert('zones', fields));
      }
    }

    for (const agent of reboundAgents) {
      const zone_id = zoneIds.get(agent.zoneCode);
      if (!zone_id) throw new Error(`Missing zone for agent ${agent.code}`);

      const existing = await ctx.db
        .query('agents')
        .withIndex('code', (q) => q.eq('code', agent.code))
        .unique();

      const fields = {
        zone_id,
        code: agent.code,
        name: agent.name,
        description: agent.description,
        status: 'idle' as const,
        desk_iso_x: agent.desk_iso_x,
        desk_iso_y: agent.desk_iso_y,
        is_chat_enabled: agent.is_chat_enabled,
        persona: agent.persona,
        current_task_id: null,
        last_active_at: now,
      };

      if (existing) {
        await ctx.db.patch(existing._id, fields);
      } else {
        await ctx.db.insert('agents', fields);
      }
    }

    for (const player of reboundPlayers) {
      const current_zone_id = zoneIds.get(player.zoneCode) ?? null;
      const existing = await ctx.db
        .query('players')
        .withIndex('auth_user_id', (q) => q.eq('auth_user_id', player.auth_user_id))
        .unique();

      const fields = {
        auth_user_id: player.auth_user_id,
        display_name: player.display_name,
        role: player.role,
        current_zone_id,
        pos_iso_x: player.pos_iso_x,
        pos_iso_y: player.pos_iso_y,
        status: 'offline' as const,
        avatar_config: player.avatar_config,
        last_seen_at: now,
      };

      if (existing) {
        await ctx.db.patch(existing._id, fields);
      } else {
        await ctx.db.insert('players', fields);
      }
    }

    await ctx.db.insert('events', {
      agent_id: null,
      task_id: null,
      project_id: null,
      event_type: 'completed',
      message: 'REBOUND AI VILLAGE seed data synced.',
      metadata: { zones: reboundZones.length, agents: reboundAgents.length, players: reboundPlayers.length },
      created_at: now,
    });

    return {
      zones: reboundZones.length,
      agents: reboundAgents.length,
      players: reboundPlayers.length,
    };
  },
});

export const overview = query({
  args: {},
  handler: async (ctx) => {
    const [zones, agents, players, events, announcements] = await Promise.all([
      ctx.db.query('zones').collect(),
      ctx.db.query('agents').collect(),
      ctx.db.query('players').collect(),
      ctx.db.query('events').withIndex('created_at').order('desc').take(20),
      ctx.db.query('announcements').withIndex('starts_at').order('desc').take(10),
    ]);

    return { zones, agents, players, events, announcements };
  },
});

export const postVillageMessage = mutation({
  args: {
    from_type: v.union(v.literal('player'), v.literal('agent'), v.literal('system')),
    from_id: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('chat_messages', {
      from_type: args.from_type,
      from_id: args.from_id,
      channel: 'village',
      to_id: null,
      message: args.message,
      created_at: Date.now(),
    });
  },
});

export const createEvent = mutation({
  args: {
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
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('events', {
      agent_id: args.agent_id,
      task_id: args.task_id,
      project_id: args.project_id,
      event_type: args.event_type,
      message: args.message,
      metadata: args.metadata ?? {},
      created_at: Date.now(),
    });
  },
});
