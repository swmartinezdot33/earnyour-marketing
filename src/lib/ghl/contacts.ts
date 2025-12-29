import { updateUser } from "@/lib/db/users";

/**
 * Updates a user's GHL contact ID after creating/updating a contact in HighLevel
 * @param userId - The user's ID in our database
 * @param contactId - The contact ID returned from HighLevel API
 * @param locationId - Optional location ID if available
 */
export async function storeGHLContactId(
  userId: string,
  contactId: string,
  locationId?: string
): Promise<void> {
  try {
    const updates: { ghl_contact_id: string; ghl_location_id?: string } = {
      ghl_contact_id: contactId,
    };
    
    if (locationId) {
      updates.ghl_location_id = locationId;
    }
    
    await updateUser(userId, updates);
  } catch (error) {
    console.error("Error storing GHL contact ID:", error);
    throw error;
  }
}

/**
 * Example function to create a contact in HighLevel and store the contact ID
 * This should be called when you get a response from HighLevel API
 * 
 * @example
 * ```typescript
 * // After calling HighLevel API to create contact
 * const ghlResponse = await createContactInGHL(userData);
 * if (ghlResponse.contact?.id) {
 *   await storeGHLContactId(userId, ghlResponse.contact.id, ghlResponse.locationId);
 * }
 * ```
 */
export async function handleGHLContactResponse(
  userId: string,
  ghlResponse: { contact?: { id: string }; contactId?: string; locationId?: string }
): Promise<void> {
  const contactId = ghlResponse.contact?.id || ghlResponse.contactId;
  
  if (!contactId) {
    console.warn("No contact ID in GHL response for user:", userId);
    return;
  }
  
  await storeGHLContactId(userId, contactId, ghlResponse.locationId);
}

