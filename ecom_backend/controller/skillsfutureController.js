// SHAWN LOOK OUT!!!!
const dotenv = require("dotenv");
dotenv.config();

const TOKEN_URL = "https://public-api.ssg-wsg.sg/dp-oauth/oauth/token";
const CLIENT_ID = process.env.CLIENT_ID || "f6b470f4b29b47abba0c0631af0d94d9";
const CLIENT_SECRET =
  process.env.CLIENT_SECRET || "MDkwNmE0NTItZTIzNi00NzlkLWFhZmMtZjIwZDNi";

// Token caching variables
let cachedAccessToken = null;
let tokenExpirationTime = 0;

/**
 * Helper: Fetch and cache the access token.
 */
const fetchAccessToken = async () => {
  if (cachedAccessToken && Date.now() < tokenExpirationTime) {
    console.log("Using cached access token.");
    return cachedAccessToken;
  }

  const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
    "base64"
  );

  const headers = {
    Authorization: `Basic ${authHeader}`,
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "PostmanRuntime/7.43.0",
    Accept: "*/*",
    "Cache-Control": "no-cache",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
  };

  console.log("Request headers for token:", headers);

  const tokenResponse = await fetch(TOKEN_URL, {
    method: "POST",
    headers,
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  console.log("Token endpoint status:", tokenResponse.status);

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error("Token request error details:", errorText);
    throw new Error(`Token request failed with status ${tokenResponse.status}`);
  }

  const tokenData = await tokenResponse.json();
  cachedAccessToken = tokenData.access_token;
  // Set expiration time (subtracting a few seconds to be safe)
  tokenExpirationTime = Date.now() + (tokenData.expires_in - 5) * 1000;
  console.log(
    "New token cached, expires at:",
    new Date(tokenExpirationTime).toLocaleTimeString()
  );
  return cachedAccessToken;
};

/**
 * Endpoint: Get Access Token (for testing/demo)
 */
const getAccessToken = async (req, res) => {
  try {
    const accessToken = await fetchAccessToken();
    res.status(200).json({ access_token: accessToken });
  } catch (error) {
    console.error("Error fetching access token:", error.message);
    res.status(500).json({ error: "Error fetching access token" });
  }
};

/**
 * Endpoint: Fetch Courses
 * Uses dynamic keyword and page from query string.
 */
const fetchCourses = async (req, res) => {
  console.log("fetchCourses");
  try {
    const accessToken = await fetchAccessToken();
    console.log("Access token received:", accessToken);

    // Read keyword and page from query string; default page to "1"
    const keyword = req.query.keyword || "business";
    const page = req.query.page || "1";

    const COURSE_DIRECTORY_API_URL =
      "https://public-api.ssg-wsg.sg/courses/directory" +
      `?pageSize=12&page=${encodeURIComponent(page)}` +
      `&keyword=${encodeURIComponent(keyword)}` +
      "&taggingCodes=%22List%22%5B%20%221%2C2%22%20%5D" +
      "&courseSupportEndDate=20190811&retrieveType=FULL&lastUpdateDate=20190811";

    console.log("Fetching courses with URL:", COURSE_DIRECTORY_API_URL);

    const apiResponse = await fetch(COURSE_DIRECTORY_API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("Courses API error details:", errorText);
      return res.status(apiResponse.status).json({
        error: `Courses API request failed with status ${apiResponse.status}`,
      });
    }

    const apiData = await apiResponse.json();
    // Transform the data to a consistent shape.
    const transformedCourses = apiData.data.courses.map((course) => ({
      ...course,
      category: course.category || "",
      provider: course.trainingProviderAlias || "",
      date: course.meta?.createDate ? course.meta.createDate.split("T")[0] : "",
      objective: course.objective || "",
      totalCostOfTrainingPerTrainee: course.totalCostOfTrainingPerTrainee || 0,
      totalTrainingDurationHour: course.totalTrainingDurationHour || 0,
    }));

    res.status(200).json({ data: { courses: transformedCourses } });
  } catch (error) {
    console.error("Error fetching courses:", error.message);
    res.status(500).json({ error: "Error fetching courses" });
  }
};

/**
 * Endpoint: Fetch Course Tags
 */
const fetchCourseTag = async (req, res) => {
  console.log("fetchCourseTag");
  try {
    const TAG_API_URL = "https://public-api.ssg-wsg.sg/courses/tags";
    const accessToken = await fetchAccessToken();

    const apiResponse = await fetch(TAG_API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "API-Version": "v1",
      },
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("Course tag API error details:", errorText);
      return res.status(apiResponse.status).json({
        error: `Course tag API request failed with status ${apiResponse.status}`,
      });
    }

    const data = await apiResponse.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching course tags:", error.message);
    res.status(500).json({ error: "Error fetching course tags" });
  }
};

module.exports = {
  getAccessToken,
  fetchCourses,
  fetchCourseTag,
};
