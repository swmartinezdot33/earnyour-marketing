// GoHighLevel Subaccount Management
// For agency-level operations to create and manage subaccounts

import { GHLClient } from "./client";

export interface GHLSubaccount {
  id: string;
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  website?: string;
  timezone?: string;
  currency?: string;
  createdAt?: string;
}

export interface CreateSubaccountData {
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  website?: string;
  timezone?: string;
  currency?: string;
}

/**
 * Create a GHL client using the agency-level PIT token
 * This is used for creating subaccounts (agency-level operation)
 */
export function getAgencyGHLClient(): GHLClient {
  const agencyToken = process.env.GHL_AGENCY_PIT_TOKEN;
  if (!agencyToken) {
    throw new Error("GHL_AGENCY_PIT_TOKEN is not set. Required for creating subaccounts.");
  }
  
  // Agency-level operations don't need a location ID
  return new GHLClient(agencyToken, undefined);
}

/**
 * Create a new GHL subaccount/location
 * Requires agency-level PIT token
 */
export async function createGHLSubaccount(
  data: CreateSubaccountData
): Promise<GHLSubaccount> {
  const client = getAgencyGHLClient();
  
  const payload: any = {
    name: data.name,
  };
  
  if (data.companyName) payload.companyName = data.companyName;
  if (data.email) payload.email = data.email;
  if (data.phone) payload.phone = data.phone;
  if (data.address) payload.address = data.address;
  if (data.website) payload.website = data.website;
  if (data.timezone) payload.timezone = data.timezone;
  if (data.currency) payload.currency = data.currency;
  
  const response = await client.request("/locations/v2", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  
  return response.location || response;
}

/**
 * Get all subaccounts/locations under the agency account
 */
export async function getAllGHLSubaccounts(): Promise<GHLSubaccount[]> {
  const client = getAgencyGHLClient();
  
  const response = await client.request("/locations/v2", {
    method: "GET",
  });
  
  return response.locations || response.data || [];
}

/**
 * Get a specific subaccount by ID
 */
export async function getGHLSubaccountById(
  locationId: string
): Promise<GHLSubaccount | null> {
  const client = getAgencyGHLClient();
  
  try {
    const response = await client.request(`/locations/v2/${locationId}`, {
      method: "GET",
    });
    
    return response.location || response;
  } catch (error) {
    console.error("Error getting subaccount:", error);
    return null;
  }
}

/**
 * Update a subaccount
 */
export async function updateGHLSubaccount(
  locationId: string,
  updates: Partial<CreateSubaccountData>
): Promise<GHLSubaccount> {
  const client = getAgencyGHLClient();
  
  const response = await client.request(`/locations/v2/${locationId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  
  return response.location || response;
}

/**
 * Delete a subaccount
 */
export async function deleteGHLSubaccount(locationId: string): Promise<void> {
  const client = getAgencyGHLClient();
  
  await client.request(`/locations/v2/${locationId}`, {
    method: "DELETE",
  });
}

/**
 * Generate a PIT token for a subaccount
 * This allows the subaccount to have its own API access
 */
export async function generateSubaccountPITToken(
  locationId: string,
  tokenName: string = "EarnYour App API Token"
): Promise<string> {
  const client = getAgencyGHLClient();
  
  const response = await client.request(`/locations/v2/${locationId}/tokens`, {
    method: "POST",
    body: JSON.stringify({
      name: tokenName,
      scopes: [
        "contacts.readonly",
        "contacts.write",
        "tags.readonly",
        "tags.write",
        "customFields.readonly",
        "customFields.write",
        "pipelines.readonly",
        "pipelines.write",
        "automations.readonly",
        "automations.write",
      ],
    }),
  });
  
  return response.token || response.apiToken || "";
}




