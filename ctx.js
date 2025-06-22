const PLATFORM_BASE_URLS = {
  staging: "https://platform-dev.getalchemystai.com",
  main: "https://platform-backend.getalchemystai.com",
};

const PLATFORM_API_KEY = process.env.PLATFORM_API_KEY;

/**
 * Fetches OpenAPI documentation from the platform backend.
 * @param {string} [branch="main"] - The branch name to fetch documentation from.
 * @returns {Promise<object|null>} The OpenAPI documentation as JSON object, or null if fetch fails.
 * @async
 */ const fetchOpenApiJson = async (branch = "main") => {
  try {
    const openApiJsonUrl = `${PLATFORM_BASE_URLS[branch]}/api/openapi.json`;
    const openApiRes = await fetch(
      openApiJsonUrl
    );

    if (!openApiRes.ok) {
      console.log(`Response not okay from ${openApiJsonUrl}. Error code: `, openApiRes.status);
      return null;
    }

    const openApiJson = await openApiRes.json();

    console.log(`Discovered ${Object.keys(openApiJson.paths ?? {}).length} paths in OpenAPI JSON.`);

    return openApiJson;
  } catch (error) {
    console.log("Error encountered while fetching OpenAPI JSON: ", error.message);
    return null;
  }
};

const doesOpenApiContextExist = async (branch = "main") => {
  const fetchDocsRes = await fetch(
    `${PLATFORM_BASE_URLS[branch]}/api/v1/context/view/docs`,
    {
      headers: {
        Authorization: `Bearer ${PLATFORM_API_KEY}`,
      },
    }
  );

  if (!fetchDocsRes.ok) {
    console.log("Response from /api/v1/context/view/docs is not okay. Status: ", fetchDocsRes.status);
    return null;
  }

  const fetchDocResJson = await fetchDocsRes.json();

  const exists = (fetchDocResJson.documents ?? [])
    .map((doc) => doc._id)
    .filter((name) => name.toLowerCase().includes("openapi.json"));

  return exists.length > 0;
};

const deleteExistingOpenApiContext = async (branch = "main") => {
  const deleteContextRequest = {
    source: "openapi.json",
    by_doc: true,
    by_id: false,
  };

  console.log("Delete context request = ", JSON.stringify(deleteContextRequest));
  console.log("Deleting openapi.json file currently existing in context...");
  const response = await fetch(
    `${PLATFORM_BASE_URLS[branch]}/api/v1/context/delete`,
    {
      method: "POST",
      body: JSON.stringify(deleteContextRequest),
      headers: {
        Authorization: `Bearer ${PLATFORM_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    console.log("Response from /api/v1/context/delete is not okay. Response: ", await response.json());
    return null;
  }

  const resJson = await response.json();

  return resJson;
};

/**
 * Adds new OpenAPI context to the documentation.
 * @param {Record<string, any>} newOpenApiContext - The new OpenAPI context to add.
 * @param {string} [branch="main"] - The branch name to add documentation to.
 * @returns {Promise<boolean>} True if successfully added, false otherwise.
 * @async
 */
const addNewOpenApiContext = async (newOpenApiContext, branch = "main") => {
  try {
    const openApiContext = JSON.stringify(newOpenApiContext);
    if (!newOpenApiContext) return null;
    
    console.log("Adding context of OpenAPI.json...");
    const addResponse = await fetch(
      `${PLATFORM_BASE_URLS[branch]}/api/v1/context/add`,
      {
        method: "POST",
        body: JSON.stringify({
          fileName: "openapi.json",
          fileType: "application/json",
          fileSize: openApiContext.length * 16,
          lastModified: new Date().toISOString(),
          content: openApiContext,
          scope: "external",
        }),
        signal: AbortSignal.timeout(30_000),
        headers: {
          Authorization: `Bearer ${PLATFORM_API_KEY}`,
        },
      }
    );

    return addResponse.ok;
  } catch (error) {
    console.error("Error adding new OpenAPI context:", error);
    return false;
  }
};

/**
 * Replaces the existing OpenAPI file context with a new one.
 * First checks if OpenAPI context exists, if it does, deletes it.
 * Then fetches the latest OpenAPI JSON and adds it as new context.
 *
 * @param {string} [branch="main"] - The branch name to replace documentation in.
 * @returns {Promise<boolean|null>} Returns true if successfully replaced, false if error occurred,
 *                                 or null if latest OpenAPI JSON couldn't be fetched.
 * @async
 */
const replaceOpenApiFileContext = async (branch = "main") => {
  try {
    const [checkIfOpenApiExists, latestOpenApiJson] = await Promise.all([
      doesOpenApiContextExist(branch),
      fetchOpenApiJson(branch),
    ]);

    if (checkIfOpenApiExists) {
      await deleteExistingOpenApiContext(branch);
    }

    if (!latestOpenApiJson) {
      return null;
    }

    const addOpenApiResponse = await addNewOpenApiContext(
      latestOpenApiJson,
      branch
    );

    return addOpenApiResponse.ok;
  } catch (err) {
    console.log("Failed to replace OpenAPI file context. Error: ", err.message);
    return false;
  }
};

replaceOpenApiFileContext("main");
