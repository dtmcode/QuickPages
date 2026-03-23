declare const _default: () => {
    database: {
        url: string | undefined;
    };
    jwt: {
        secret: string | undefined;
        expiresIn: string;
    };
    upload: {
        path: string;
        maxSize: number;
    };
    isDevelopment: boolean;
};
export default _default;
