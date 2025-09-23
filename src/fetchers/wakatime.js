import axios from "axios";
import { CustomError, MissingParamError } from "../common/utils.js";

/**
 * WakaTime data fetcher.
 *
 * @param {{username: string, api_domain: string }} props Fetcher props.
 * @returns {Promise<WakaTimeData>} WakaTime data response.
 */
const fetchWakatimeStats = async ({ username, api_domain }) => {
  if (!username) {
    throw new MissingParamError(["username"]);
  }

  // Allow-list of API domains (add other self-hosted instances if needed)
  const ALLOWED_API_DOMAINS = [
    "wakatime.com",
    // Add other trusted domains below, e.g., "custom.wakatime-instance.com"
  ];

  // Validate api_domain against allow-list, otherwise fallback to default
  let safeApiDomain;
  if (api_domain && ALLOWED_API_DOMAINS.includes(api_domain.replace(/\/$/gi, "").toLowerCase())) {
    safeApiDomain = api_domain.replace(/\/$/gi, "").toLowerCase();
  } else {
    safeApiDomain = "wakatime.com";
  }

  // Sanitize username: allow only [a-zA-Z0-9_-]
  const safeUsername = String(username).match(/^[a-zA-Z0-9_-]+$/)
    ? username
    : (() => { throw new MissingParamError(["username"]); })();

  try {
    const { data } = await axios.get(
      `https://${safeApiDomain}/api/v1/users/${safeUsername}/stats?is_including_today=true`,
    );

    return data.data;
  } catch (err) {
    if (err.response.status < 200 || err.response.status > 299) {
      throw new CustomError(
        `Could not resolve to a User with the login of '${safeUsername}'`,
        "WAKATIME_USER_NOT_FOUND",
      );
    }
    throw err;
  }
};

export { fetchWakatimeStats };
export default fetchWakatimeStats;
