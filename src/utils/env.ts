const environment = import.meta.env;

export const variables = () => ({
    API_URL : environment.VITE_API_URL,

});
