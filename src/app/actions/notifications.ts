"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

/**
 * Helper function to create notification in DB safely
 */
export async function createNotificationAction(params: {
  userId: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("notifications").insert({
      user_id: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || "info",
      link: params.link || null,
      is_read: false,
    });

    if (error) {
      console.warn("createNotificationAction DB warning:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    console.warn("createNotificationAction exception:", err);
    return { success: false, error: "Failed to create notification." };
  }
}

/**
 * Fetch current user notifications
 */
export async function fetchUserNotificationsAction(): Promise<{
  success: boolean;
  notifications?: NotificationItem[];
  unreadCount?: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized." };

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    const unreadCount = (notifications || []).filter((n) => !n.is_read).length;

    return {
      success: true,
      notifications: notifications || [],
      unreadCount,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch notifications.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationReadAction(notificationId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized." };

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (error) throw error;

    revalidatePath("/student");
    revalidatePath("/company");
    revalidatePath("/mentor");
    revalidatePath("/admin");

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to mark notification read.";
    return { success: false, error: errorMessage };
  }
}
