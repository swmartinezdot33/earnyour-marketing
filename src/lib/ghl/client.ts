// GoHighLevel API 2.0 Client
// Documentation: https://highlevel.stoplight.io/docs/integrations

const GHL_API_BASE = "https://services.leadconnectorhq.com";
const GHL_API_TOKEN = process.env.GHL_API_TOKEN; // PIT Token
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

if (!GHL_API_TOKEN) {
  console.warn("GHL_API_TOKEN is not set. GoHighLevel integration will not work.");
}

export interface GHLContact {
  id?: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface GHLTag {
  id: string;
  name: string;
}

export class GHLClient {
  private baseUrl: string;
  private token: string;
  private locationId: string | undefined;

  constructor(token?: string, locationId?: string) {
    this.baseUrl = GHL_API_BASE;
    this.token = token || GHL_API_TOKEN || "";
    this.locationId = locationId || GHL_LOCATION_ID;
  }

  async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    if (!this.token) {
      throw new Error("GHL_API_TOKEN is not configured");
    }

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GHL API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Create or update a contact
  async createOrUpdateContact(contact: GHLContact): Promise<GHLContact> {
    const endpoint = this.locationId
      ? `/contacts/v2/locations/${this.locationId}`
      : "/contacts/v2";

    const payload: any = {
      email: contact.email,
    };

    if (contact.phone) payload.phone = contact.phone;
    if (contact.firstName) payload.firstName = contact.firstName;
    if (contact.lastName) payload.lastName = contact.lastName;
    if (contact.name) {
      const nameParts = contact.name.split(" ");
      payload.firstName = nameParts[0] || contact.name;
      payload.lastName = nameParts.slice(1).join(" ") || "";
    }
    if (contact.customFields) payload.customFields = contact.customFields;

    const response = await this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return response.contact || response;
  }

  // Search for a contact by email
  async findContactByEmail(email: string): Promise<GHLContact | null> {
    try {
      const endpoint = this.locationId
        ? `/contacts/v2/locations/${this.locationId}/search`
        : "/contacts/v2/search";

      const response = await this.request(endpoint, {
        method: "POST",
        body: JSON.stringify({
          query: {
            email: email,
          },
        }),
      });

      if (response.contacts && response.contacts.length > 0) {
        return response.contacts[0];
      }

      return null;
    } catch (error) {
      console.error("Error finding contact:", error);
      return null;
    }
  }

  // Add tags to a contact
  async addTagsToContact(contactId: string, tagNames: string[]): Promise<void> {
    if (!this.locationId) {
      throw new Error("GHL_LOCATION_ID is required for tagging");
    }

    // First, get or create tags
    const tagIds: string[] = [];
    for (const tagName of tagNames) {
      const tag = await this.getOrCreateTag(tagName);
      if (tag) tagIds.push(tag.id);
    }

    // Add tags to contact
    await this.request(`/contacts/v2/locations/${this.locationId}/${contactId}/tags`, {
      method: "POST",
      body: JSON.stringify({
        tags: tagIds,
      }),
    });
  }

  // Get or create a tag
  async getOrCreateTag(tagName: string): Promise<GHLTag | null> {
    if (!this.locationId) {
      throw new Error("GHL_LOCATION_ID is required for tags");
    }

    try {
      // Search for existing tag
      const tags = await this.request(`/tags/v2/locations/${this.locationId}`);
      
      if (tags.tags) {
        const existingTag = tags.tags.find((t: GHLTag) => 
          t.name.toLowerCase() === tagName.toLowerCase()
        );
        if (existingTag) return existingTag;
      }

      // Create new tag
      const newTag = await this.request(`/tags/v2/locations/${this.locationId}`, {
        method: "POST",
        body: JSON.stringify({
          name: tagName,
        }),
      });

      return newTag.tag || newTag;
    } catch (error) {
      console.error("Error creating tag:", error);
      return null;
    }
  }

  // Update custom fields on a contact
  async updateCustomFields(contactId: string, customFields: Record<string, any>): Promise<void> {
    if (!this.locationId) {
      throw new Error("GHL_LOCATION_ID is required for updating custom fields");
    }

    await this.request(`/contacts/v2/locations/${this.locationId}/${contactId}`, {
      method: "PUT",
      body: JSON.stringify({
        customFields,
      }),
    });
  }

  // Get contact by ID
  async getContactById(contactId: string): Promise<GHLContact | null> {
    if (!this.locationId) {
      throw new Error("GHL_LOCATION_ID is required");
    }

    try {
      const response = await this.request(`/contacts/v2/locations/${this.locationId}/${contactId}`);
      return response.contact || response;
    } catch (error) {
      console.error("Error getting contact:", error);
      return null;
    }
  }

  // Remove tags from a contact
  async removeTagsFromContact(contactId: string, tagIds: string[]): Promise<void> {
    if (!this.locationId) {
      throw new Error("GHL_LOCATION_ID is required for tagging");
    }

    await this.request(`/contacts/v2/locations/${this.locationId}/${contactId}/tags`, {
      method: "DELETE",
      body: JSON.stringify({
        tags: tagIds,
      }),
    });
  }

  // Delete a contact (GHL API 2.0)
  async deleteContact(contactId: string): Promise<void> {
    if (!this.locationId) {
      throw new Error("GHL_LOCATION_ID is required for deleting contacts");
    }

    await this.request(`/contacts/v2/locations/${this.locationId}/${contactId}`, {
      method: "DELETE",
    });
  }
}

export const ghlClient = new GHLClient();

