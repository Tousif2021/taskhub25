
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Auth session error:", error.message);
          setIsLoading(false);
          return;
        }
        
        setSession(data.session);
        setUser(data.session?.user || null);
        
        if (data.session?.user) {
          // Fetch user profile
          await fetchProfile(data.session.user.id);
        }
      } catch (error: any) {
        console.error("Error getting session:", error.message);
      } finally {
        // Ensure loading state is cleared even if there's an error
        setTimeout(() => setIsLoading(false), 300);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event);
        setSession(newSession);
        setUser(newSession?.user || null);
        
        if (newSession?.user) {
          // Fetch user profile when auth state changes
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) {
        console.error("Profile fetch error:", error.message);
        return;
      }
      
      setProfile(data);
    } catch (error: any) {
      console.error("Error fetching profile:", error.message);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "There was an error signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && !session) {
      setRedirecting(true);
      navigate("/auth");
    }
  }, [session, isLoading, navigate]);

  if (isLoading || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  return session ? <>{children}</> : null;
};
