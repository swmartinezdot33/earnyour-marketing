import { ghlClient } from "./client";

export async function getAllTags() {
  try {
    const tags = await ghlClient.request(`/tags/v2/locations/${process.env.GHL_LOCATION_ID}`);
    return tags.tags || [];
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
}

export async function createTag(tagName: string) {
  return await ghlClient.getOrCreateTag(tagName);
}




