import { ghlClient, GHLClient } from "./client";

export interface Automation {
  id: string;
  name: string;
  status: "active" | "inactive";
}

/**
 * Trigger an automation workflow for a contact
 */
export async function triggerAutomation(
  contactId: string,
  automationId: string,
  locationId?: string
): Promise<void> {
  const client = locationId && process.env.GHL_API_TOKEN 
    ? new GHLClient(process.env.GHL_API_TOKEN, locationId) 
    : ghlClient;
  const locId = locationId || process.env.GHL_LOCATION_ID;
  
  if (!locId) {
    throw new Error("GHL_LOCATION_ID is required");
  }

  await client.request(
    `/automations/v2/locations/${locId}/contacts/${contactId}/trigger`,
    {
      method: "POST",
      body: JSON.stringify({
        automationId,
      }),
    }
  );
}

/**
 * Get all automations for a location
 */
export async function getAutomations(
  locationId?: string
): Promise<Automation[]> {
  const client = locationId && process.env.GHL_API_TOKEN 
    ? new GHLClient(process.env.GHL_API_TOKEN, locationId) 
    : ghlClient;
  const locId = locationId || process.env.GHL_LOCATION_ID;
  
  if (!locId) {
    throw new Error("GHL_LOCATION_ID is required");
  }

  try {
    const response = await client.request(
      `/automations/v2/locations/${locId}`
    );
    
    return response.automations || [];
  } catch (error) {
    console.error("Error getting automations:", error);
    return [];
  }
}

/**
 * Get a specific automation by ID
 */
export async function getAutomationById(
  automationId: string,
  locationId?: string
): Promise<Automation | null> {
  const client = locationId && process.env.GHL_API_TOKEN 
    ? new GHLClient(process.env.GHL_API_TOKEN, locationId) 
    : ghlClient;
  const locId = locationId || process.env.GHL_LOCATION_ID;
  
  if (!locId) {
    throw new Error("GHL_LOCATION_ID is required");
  }

  try {
    const response = await client.request(
      `/automations/v2/locations/${locId}/${automationId}`
    );
    
    return response.automation || response;
  } catch (error) {
    console.error("Error getting automation:", error);
    return null;
  }
}

