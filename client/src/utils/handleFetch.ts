export interface HandleFetchArgs {
  fetch: <T>() => Promise<{ status: number; data: T }>;
}

export interface HandleFetchResponse<T> {
  status?: number;
  data: T;
  error: any;
}

export const handleFetch = async <T>({ fetch }: HandleFetchArgs) => {
  try {
    const { status, data } = await fetch<T>();
    if (status.toString()[0] !== "2") {
      return {
        error: "Помилка запиту. Видалення не вдалося.",
        data: null,
      };
    }

    return { status, data, error: null } as HandleFetchResponse<T>;
  } catch (error: any) {
    return {
      error: error.response?.data?.error || "Внутрішня помилка сервера",
      data: null,
    } as HandleFetchResponse<T>;
  }
};
