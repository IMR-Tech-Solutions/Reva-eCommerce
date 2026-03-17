import api from "./baseapi";

export const getAllPaginatedData = async (endpoint: string, params = {}) => {
  let results: any[] = [];
  let url = endpoint;
  let query = { ...params };

  try {
    while (url) {
      const response = await api.get(url, { params: query });
      const data = response.data;
      results = [...results, ...data.results];
      url = data.next;
      query = {};
    }

    return results;
  } catch (error: any) {
    console.error("Error fetching all paginated data:", error);
    // Don't modify error response, just log and re-throw
    throw error?.response?.data || error;
  }
};
