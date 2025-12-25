import { ghlClient, GHLClient } from "./client";

export interface PipelineStage {
  id: string;
  name: string;
  pipelineId: string;
}

export interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
}

/**
 * Move a contact to a specific pipeline stage
 */
export async function moveToPipelineStage(
  contactId: string,
  pipelineId: string,
  stageId: string,
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
    `/opportunities/v2/locations/${locId}/${contactId}`,
    {
      method: "POST",
      body: JSON.stringify({
        pipelineId,
        pipelineStageId: stageId,
      }),
    }
  );
}

/**
 * Get all stages for a pipeline
 */
export async function getPipelineStages(
  pipelineId: string,
  locationId?: string
): Promise<PipelineStage[]> {
  const client = locationId && process.env.GHL_API_TOKEN 
    ? new GHLClient(process.env.GHL_API_TOKEN, locationId) 
    : ghlClient;
  const locId = locationId || process.env.GHL_LOCATION_ID;
  
  if (!locId) {
    throw new Error("GHL_LOCATION_ID is required");
  }

  try {
    const response = await client.request(
      `/pipelines/v2/locations/${locId}/${pipelineId}`
    );
    
    return response.pipeline?.stages || response.stages || [];
  } catch (error) {
    console.error("Error getting pipeline stages:", error);
    return [];
  }
}

/**
 * Get all pipelines for a location
 */
export async function getPipelines(
  locationId?: string
): Promise<Pipeline[]> {
  const client = locationId && process.env.GHL_API_TOKEN 
    ? new GHLClient(process.env.GHL_API_TOKEN, locationId) 
    : ghlClient;
  const locId = locationId || process.env.GHL_LOCATION_ID;
  
  if (!locId) {
    throw new Error("GHL_LOCATION_ID is required");
  }

  try {
    const response = await client.request(
      `/pipelines/v2/locations/${locId}`
    );
    
    return response.pipelines || [];
  } catch (error) {
    console.error("Error getting pipelines:", error);
    return [];
  }
}

/**
 * Create or get course pipeline
 * Creates a pipeline for course enrollments if it doesn't exist
 */
export async function createCoursePipeline(
  locationId?: string
): Promise<Pipeline> {
  const client = locationId && process.env.GHL_API_TOKEN 
    ? new GHLClient(process.env.GHL_API_TOKEN, locationId) 
    : ghlClient;
  const locId = locationId || process.env.GHL_LOCATION_ID;
  
  if (!locId) {
    throw new Error("GHL_LOCATION_ID is required");
  }

  // Check if course pipeline already exists
  const pipelines = await getPipelines(locId);
  const existingPipeline = pipelines.find(
    (p: Pipeline) => p.name === "Course Enrollments"
  );

  if (existingPipeline) {
    return existingPipeline;
  }

  // Create new pipeline with stages
  try {
    const response = await client.request(
      `/pipelines/v2/locations/${locId}`,
      {
        method: "POST",
        body: JSON.stringify({
          name: "Course Enrollments",
          stages: [
            { name: "New Enrollment" },
            { name: "Course In Progress" },
            { name: "Course Completed" },
            { name: "Certified" },
          ],
        }),
      }
    );

    return response.pipeline || response;
  } catch (error) {
    console.error("Error creating course pipeline:", error);
    throw error;
  }
}

