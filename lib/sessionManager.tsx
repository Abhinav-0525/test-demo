import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface UserSession {
  userId: string;
  sessionToken: string;
  email: string;
  name: string;
  startedAt: string;
}

const SESSION_KEY = 'asbl_user_session';
const ACTIVITY_INTERVAL = 30000; // Update activity every 30 seconds

export class SessionManager {
  private supabase = createClientComponentClient();
  private activityInterval: NodeJS.Timeout | null = null;

  // Check if user has active session
  hasActiveSession(): boolean {
    const session = this.getSession();
    return !!session;
  }

  // Get current session from localStorage
  getSession(): UserSession | null {
    if (typeof window === 'undefined') return null;
    
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;

    try {
      return JSON.parse(sessionData);
    } catch {
      return null;
    }
  }

  // Save session to localStorage
  private saveSession(session: UserSession): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  // Create new session
  async createSession(userId: string, email: string, name: string): Promise<UserSession> {
    const sessionToken = this.generateSessionToken();
    const browserInfo = this.getBrowserInfo();

    // Create session in database
    const { data: sessionData, error: sessionError } = await this.supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        browser_info: browserInfo,
        is_active: true
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Invalidate all other sessions for this user
    await this.supabase.rpc('invalidate_previous_sessions', {
      p_user_id: userId,
      p_current_session_id: sessionData.id
    });

    // Record login in history
    await this.supabase
      .from('login_history')
      .insert({
        user_id: userId,
        session_id: sessionData.id,
        login_method: 'otp'
      });

    const session: UserSession = {
      userId,
      sessionToken,
      email,
      name,
      startedAt: new Date().toISOString()
    };

    this.saveSession(session);
    this.startActivityTracking();

    return session;
  }

  // End current session
  async endSession(): Promise<void> {
    const session = this.getSession();
    if (!session) return;

    this.stopActivityTracking();

    // Update session in database
    const { data: sessionData } = await this.supabase
      .from('user_sessions')
      .select('id')
      .eq('session_token', session.sessionToken)
      .single();

    if (sessionData) {
      const startedAt = new Date(session.startedAt);
      const endedAt = new Date();
      const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);

      await this.supabase
        .from('user_sessions')
        .update({
          is_active: false,
          ended_at: endedAt.toISOString(),
          duration_seconds: durationSeconds
        })
        .eq('id', sessionData.id);
    }

    // Clear session from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  // Update session activity (heartbeat)
  private async updateActivity(): Promise<void> {
    const session = this.getSession();
    if (!session) return;

    await this.supabase
      .from('user_sessions')
      .update({
        last_activity: new Date().toISOString()
      })
      .eq('session_token', session.sessionToken);
  }

  // Start tracking user activity
  private startActivityTracking(): void {
    this.stopActivityTracking();
    
    this.activityInterval = setInterval(() => {
      this.updateActivity();
    }, ACTIVITY_INTERVAL);

    // Update activity on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.updateActivity();
      });
    }
  }

  // Stop tracking user activity
  private stopActivityTracking(): void {
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
      this.activityInterval = null;
    }
  }

  // Record brochure download
  async recordDownload(): Promise<void> {
    const session = this.getSession();
    if (!session) return;

    const { data: sessionData } = await this.supabase
      .from('user_sessions')
      .select('id')
      .eq('session_token', session.sessionToken)
      .single();

    await this.supabase
      .from('brochure_downloads')
      .insert({
        user_id: session.userId,
        session_id: sessionData?.id || null
      });
  }

  // Get user statistics
  async getUserStats(userId: string) {
    const { data, error } = await this.supabase
      .rpc('get_user_stats', { p_user_id: userId });

    if (error) throw error;
    return data[0];
  }

  // Generate unique session token
  private generateSessionToken(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  // Get browser information
  private getBrowserInfo(): string {
    if (typeof window === 'undefined') return 'Unknown';
    return navigator.userAgent;
  }

  // Initialize session manager (call on app load)
  async initialize(): Promise<void> {
    const session = this.getSession();
    if (session) {
      // Verify session is still active in database
      const { data } = await this.supabase
        .from('user_sessions')
        .select('is_active')
        .eq('session_token', session.sessionToken)
        .single();

      if (data?.is_active) {
        this.startActivityTracking();
      } else {
        // Session is no longer active, clear it
        this.endSession();
      }
    }
  }
}

export const sessionManager = new SessionManager();