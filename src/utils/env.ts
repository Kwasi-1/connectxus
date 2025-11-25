const environment = import.meta.env;

export const variables = () => ({
    API_URL : environment.VITE_API_URL,
    API_BASE_URL : environment.VITE_API_BASE_URL,
    DEFAULT_SPACE_ID : environment.VITE_DEFAULT_SPACE_ID,
});
