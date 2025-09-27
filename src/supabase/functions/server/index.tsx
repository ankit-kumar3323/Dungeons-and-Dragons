import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from './kv_store.tsx';

const app = new Hono();

// CORS configuration
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://*.vercel.app', 'https://*.supabase.co'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
  credentials: true,
}));

// Logging
app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Authentication middleware
const requireAuth = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return c.json({ error: 'Authorization token required' }, 401);
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user?.id) {
    console.log('Authorization error during auth check:', error);
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  c.set('userId', user.id);
  c.set('userEmail', user.email);
  await next();
};

// Health check
app.get('/make-server-cdab1a91/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize demo user on server start
const initializeDemoUser = async () => {
  try {
    const demoEmail = 'demo@dndtabletop.com';
    const demoPassword = 'demo123';
    
    // Check if demo user exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const demoUserExists = existingUser?.users?.some(user => user.email === demoEmail);
    
    if (!demoUserExists) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: demoEmail,
        password: demoPassword,
        user_metadata: { name: 'Demo Adventurer' },
        email_confirm: true
      });

      if (data.user && !error) {
        // Initialize demo user profile with sample data
        await kv.set(`user:${data.user.id}:profile`, {
          id: data.user.id,
          email: data.user.email,
          name: 'Demo Adventurer',
          created_at: new Date().toISOString(),
          campaigns: [],
          characters: [],
          settings: {
            theme: 'dark',
            gridSize: 40,
            showGrid: true,
            autoSave: true
          }
        });
        
        console.log('✅ Demo user initialized successfully');
      } else {
        console.log('❌ Failed to create demo user:', error);
      }
    } else {
      console.log('✅ Demo user already exists');
    }
  } catch (error) {
    console.log('❌ Error initializing demo user:', error);
  }
};

// User signup
app.post('/make-server-cdab1a91/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || 'D&D Player' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Initialize user data
    if (data.user) {
      await kv.set(`user:${data.user.id}:profile`, {
        id: data.user.id,
        email: data.user.email,
        name: name || 'D&D Player',
        created_at: new Date().toISOString(),
        campaigns: [],
        characters: [],
        settings: {
          theme: 'dark',
          gridSize: 40,
          showGrid: true,
          autoSave: true
        }
      });
    }

    return c.json({ 
      message: 'User created successfully', 
      user: { 
        id: data.user?.id, 
        email: data.user?.email,
        name: name || 'D&D Player'
      } 
    });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// User signin
app.post('/make-server-cdab1a91/auth/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('Signin error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      message: 'Signed in successfully',
      session: data.session,
      user: data.user 
    });
  } catch (error) {
    console.log('Signin error:', error);
    return c.json({ error: 'Internal server error during signin' }, 500);
  }
});

// Get user profile
app.get('/make-server-cdab1a91/user/profile', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const profile = await kv.get(`user:${userId}:profile`);
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ profile });
  } catch (error) {
    console.log('Error fetching user profile:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Update user profile
app.put('/make-server-cdab1a91/user/profile', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const updates = await c.req.json();
    
    const existingProfile = await kv.get(`user:${userId}:profile`);
    const updatedProfile = { ...existingProfile, ...updates, updated_at: new Date().toISOString() };
    
    await kv.set(`user:${userId}:profile`, updatedProfile);
    
    return c.json({ profile: updatedProfile });
  } catch (error) {
    console.log('Error updating user profile:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Save campaign
app.post('/make-server-cdab1a91/campaigns', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const campaignData = await c.req.json();
    
    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const campaign = {
      id: campaignId,
      ...campaignData,
      owner_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`campaign:${campaignId}`, campaign);
    
    // Update user's campaign list
    const profile = await kv.get(`user:${userId}:profile`);
    if (profile) {
      profile.campaigns = [...(profile.campaigns || []), campaignId];
      await kv.set(`user:${userId}:profile`, profile);
    }
    
    return c.json({ campaign });
  } catch (error) {
    console.log('Error saving campaign:', error);
    return c.json({ error: 'Failed to save campaign' }, 500);
  }
});

// Get user campaigns
app.get('/make-server-cdab1a91/campaigns', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const profile = await kv.get(`user:${userId}:profile`);
    
    if (!profile || !profile.campaigns) {
      return c.json({ campaigns: [] });
    }
    
    const campaigns = await kv.mget(profile.campaigns.map((id: string) => `campaign:${id}`));
    
    return c.json({ campaigns: campaigns.filter(Boolean) });
  } catch (error) {
    console.log('Error fetching campaigns:', error);
    return c.json({ error: 'Failed to fetch campaigns' }, 500);
  }
});

// Update campaign
app.put('/make-server-cdab1a91/campaigns/:id', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const campaignId = c.req.param('id');
    const updates = await c.req.json();
    
    const existingCampaign = await kv.get(`campaign:${campaignId}`);
    if (!existingCampaign) {
      return c.json({ error: 'Campaign not found' }, 404);
    }
    
    if (existingCampaign.owner_id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }
    
    const updatedCampaign = { 
      ...existingCampaign, 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    
    await kv.set(`campaign:${campaignId}`, updatedCampaign);
    
    return c.json({ campaign: updatedCampaign });
  } catch (error) {
    console.log('Error updating campaign:', error);
    return c.json({ error: 'Failed to update campaign' }, 500);
  }
});

// Save battle map
app.post('/make-server-cdab1a91/maps', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const mapData = await c.req.json();
    
    const mapId = `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const battleMap = {
      id: mapId,
      ...mapData,
      owner_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`map:${mapId}`, battleMap);
    
    return c.json({ map: battleMap });
  } catch (error) {
    console.log('Error saving battle map:', error);
    return c.json({ error: 'Failed to save battle map' }, 500);
  }
});

// Get user maps
app.get('/make-server-cdab1a91/maps', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const mapKeys = await kv.getByPrefix(`map:`);
    const userMaps = mapKeys.filter((map: any) => map.owner_id === userId);
    
    return c.json({ maps: userMaps });
  } catch (error) {
    console.log('Error fetching battle maps:', error);
    return c.json({ error: 'Failed to fetch battle maps' }, 500);
  }
});

// Save character
app.post('/make-server-cdab1a91/characters', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const characterData = await c.req.json();
    
    const characterId = `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const character = {
      id: characterId,
      ...characterData,
      owner_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`character:${characterId}`, character);
    
    // Update user's character list
    const profile = await kv.get(`user:${userId}:profile`);
    if (profile) {
      profile.characters = [...(profile.characters || []), characterId];
      await kv.set(`user:${userId}:profile`, profile);
    }
    
    return c.json({ character });
  } catch (error) {
    console.log('Error saving character:', error);
    return c.json({ error: 'Failed to save character' }, 500);
  }
});

// Get user characters
app.get('/make-server-cdab1a91/characters', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const profile = await kv.get(`user:${userId}:profile`);
    
    if (!profile || !profile.characters) {
      return c.json({ characters: [] });
    }
    
    const characters = await kv.mget(profile.characters.map((id: string) => `character:${id}`));
    
    return c.json({ characters: characters.filter(Boolean) });
  } catch (error) {
    console.log('Error fetching characters:', error);
    return c.json({ error: 'Failed to fetch characters' }, 500);
  }
});

// Update character
app.put('/make-server-cdab1a91/characters/:id', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const characterId = c.req.param('id');
    const updates = await c.req.json();
    
    const existingCharacter = await kv.get(`character:${characterId}`);
    if (!existingCharacter) {
      return c.json({ error: 'Character not found' }, 404);
    }
    
    if (existingCharacter.owner_id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }
    
    const updatedCharacter = { 
      ...existingCharacter, 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    
    await kv.set(`character:${characterId}`, updatedCharacter);
    
    return c.json({ character: updatedCharacter });
  } catch (error) {
    console.log('Error updating character:', error);
    return c.json({ error: 'Failed to update character' }, 500);
  }
});

// Session management for multiplayer
app.post('/make-server-cdab1a91/sessions', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const sessionData = await c.req.json();
    
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session = {
      id: sessionId,
      ...sessionData,
      gm_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      players: [],
      active: true
    };
    
    await kv.set(`session:${sessionId}`, session);
    
    return c.json({ session });
  } catch (error) {
    console.log('Error creating session:', error);
    return c.json({ error: 'Failed to create session' }, 500);
  }
});

// Get active sessions
app.get('/make-server-cdab1a91/sessions', requireAuth, async (c) => {
  try {
    const sessions = await kv.getByPrefix('session:');
    const activeSessions = sessions.filter((session: any) => session.active);
    
    return c.json({ sessions: activeSessions });
  } catch (error) {
    console.log('Error fetching sessions:', error);
    return c.json({ error: 'Failed to fetch sessions' }, 500);
  }
});

// Join session
app.post('/make-server-cdab1a91/sessions/:id/join', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const userEmail = c.get('userEmail');
    const sessionId = c.req.param('id');
    const { playerName } = await c.req.json();
    
    const session = await kv.get(`session:${sessionId}`);
    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }
    
    // Get user profile for name
    const profile = await kv.get(`user:${userId}:profile`);
    const displayName = playerName || profile?.name || userEmail?.split('@')[0] || 'Player';
    
    // Check if player already exists, update if so
    const existingPlayerIndex = session.players.findIndex((p: any) => p.id === userId);
    const playerData = {
      id: userId,
      name: displayName,
      email: userEmail,
      character: '',
      isConnected: true,
      isGameMaster: session.gm_id === userId,
      joinedAt: new Date().toISOString()
    };
    
    if (existingPlayerIndex >= 0) {
      session.players[existingPlayerIndex] = { ...session.players[existingPlayerIndex], ...playerData, isConnected: true };
    } else {
      session.players.push(playerData);
    }
    
    session.updated_at = new Date().toISOString();
    await kv.set(`session:${sessionId}`, session);
    
    return c.json({ session });
  } catch (error) {
    console.log('Error joining session:', error);
    return c.json({ error: 'Failed to join session' }, 500);
  }
});

// Leave session
app.post('/make-server-cdab1a91/sessions/:id/leave', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const sessionId = c.req.param('id');
    
    const session = await kv.get(`session:${sessionId}`);
    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }
    
    // Mark player as disconnected instead of removing them
    const playerIndex = session.players.findIndex((p: any) => p.id === userId);
    if (playerIndex >= 0) {
      session.players[playerIndex].isConnected = false;
      session.players[playerIndex].leftAt = new Date().toISOString();
    }
    
    session.updated_at = new Date().toISOString();
    await kv.set(`session:${sessionId}`, session);
    
    return c.json({ session });
  } catch (error) {
    console.log('Error leaving session:', error);
    return c.json({ error: 'Failed to leave session' }, 500);
  }
});

// Get session details
app.get('/make-server-cdab1a91/sessions/:id', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const sessionId = c.req.param('id');
    
    const session = await kv.get(`session:${sessionId}`);
    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }
    
    // Check if user is part of this session
    const isPlayer = session.players.some((p: any) => p.id === userId);
    const isGM = session.gm_id === userId;
    
    if (!isPlayer && !isGM) {
      return c.json({ error: 'Not authorized to view this session' }, 403);
    }
    
    return c.json({ session });
  } catch (error) {
    console.log('Error fetching session:', error);
    return c.json({ error: 'Failed to fetch session' }, 500);
  }
});

// Send chat message
app.post('/make-server-cdab1a91/sessions/:id/chat', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const sessionId = c.req.param('id');
    const { message, type = 'chat' } = await c.req.json();
    
    const session = await kv.get(`session:${sessionId}`);
    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }
    
    // Verify user is part of session
    const player = session.players.find((p: any) => p.id === userId);
    const isGM = session.gm_id === userId;
    
    if (!player && !isGM) {
      return c.json({ error: 'Not authorized' }, 403);
    }
    
    // Create chat message
    const chatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      playerId: userId,
      playerName: player?.name || 'Game Master',
      message,
      timestamp: new Date().toISOString(),
      type
    };
    
    // Get existing chat messages
    const chatKey = `session:${sessionId}:chat`;
    const existingMessages = await kv.get(chatKey) || [];
    
    // Add new message and keep last 100 messages
    const updatedMessages = [...existingMessages, chatMessage].slice(-100);
    await kv.set(chatKey, updatedMessages);
    
    return c.json({ message: chatMessage });
  } catch (error) {
    console.log('Error sending chat message:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// Get chat messages
app.get('/make-server-cdab1a91/sessions/:id/chat', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const sessionId = c.req.param('id');
    
    const session = await kv.get(`session:${sessionId}`);
    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }
    
    // Verify user is part of session
    const isPlayer = session.players.some((p: any) => p.id === userId);
    const isGM = session.gm_id === userId;
    
    if (!isPlayer && !isGM) {
      return c.json({ error: 'Not authorized' }, 403);
    }
    
    const chatKey = `session:${sessionId}:chat`;
    const messages = await kv.get(chatKey) || [];
    
    return c.json({ messages });
  } catch (error) {
    console.log('Error fetching chat messages:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

// Update session state (battle map, tokens, etc.)
app.put('/make-server-cdab1a91/sessions/:id/state', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const sessionId = c.req.param('id');
    const stateUpdate = await c.req.json();
    
    const session = await kv.get(`session:${sessionId}`);
    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }
    
    // Only GM can update most session state
    const isGM = session.gm_id === userId;
    const isPlayer = session.players.some((p: any) => p.id === userId);
    
    if (!isGM && !isPlayer) {
      return c.json({ error: 'Not authorized' }, 403);
    }
    
    // Players can only update their own token positions
    if (!isGM && stateUpdate.tokens) {
      const playerTokens = stateUpdate.tokens.filter((token: any) => 
        token.type === 'player' && session.players.some((p: any) => p.id === userId && p.character === token.name)
      );
      stateUpdate.tokens = playerTokens;
    }
    
    // Get current session state
    const stateKey = `session:${sessionId}:state`;
    const currentState = await kv.get(stateKey) || {};
    
    // Merge state update
    const newState = {
      ...currentState,
      ...stateUpdate,
      updated_at: new Date().toISOString(),
      updated_by: userId
    };
    
    await kv.set(stateKey, newState);
    
    return c.json({ state: newState });
  } catch (error) {
    console.log('Error updating session state:', error);
    return c.json({ error: 'Failed to update session state' }, 500);
  }
});

// Get session state
app.get('/make-server-cdab1a91/sessions/:id/state', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const sessionId = c.req.param('id');
    
    const session = await kv.get(`session:${sessionId}`);
    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }
    
    // Verify user is part of session
    const isPlayer = session.players.some((p: any) => p.id === userId);
    const isGM = session.gm_id === userId;
    
    if (!isPlayer && !isGM) {
      return c.json({ error: 'Not authorized' }, 403);
    }
    
    const stateKey = `session:${sessionId}:state`;
    const state = await kv.get(stateKey) || {};
    
    return c.json({ state });
  } catch (error) {
    console.log('Error fetching session state:', error);
    return c.json({ error: 'Failed to fetch session state' }, 500);
  }
});

// Error handling
app.onError((err, c) => {
  console.log('Server error:', err);
  return c.json({ error: 'Internal server error', details: err.message }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Route not found' }, 404);
});

console.log('🎲 D&D Digital Tabletop Server starting...');

// Initialize demo user on startup
initializeDemoUser();

serve(app.fetch);