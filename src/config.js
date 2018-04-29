let config = {};
if (typeof IS_CLIENT !== 'undefined') {
    config = {CLIENT_CONFIG: window.CLIENT_CONFIG}
} else {
    const dotenv = require('dotenv');
    const CLIENT_CONFIG_PATTERN = /^CLIENT_CONFIG_/;
    const REGISTRY_CONFIG_PATTERN = /^REGISTRY_CONFIG_/;
    dotenv.config();

     config = {
        INCLUDE_CONTAINERS_BY_IMAGES: process.env.INCLUDE_CONTAINERS_BY_IMAGES || "", //"^registry\\.example\\.com",
        EXCLUDE_CONTAINERS_BY_IMAGES: process.env.EXCLUDE_CONTAINERS_BY_IMAGES || "^sha256\:", //,
        ...(
            Object.assign(
                {}, ...Object.keys(process.env).filter(o => REGISTRY_CONFIG_PATTERN.test(o))
                    .map(k => ({[k]: process.env[k]}))
            )
        ),
        DOCKER_HUB_REGISTRY: process.env.DOCKER_HUB_REGISTRY || "https://hub.docker.com/v2/repositories",
        MAX_TAGS: process.env.MAX_TAGS || 30,
        HTTP_PORT: process.env.HTTP_PORT || 3000,
        CLIENT_CONFIG: {
            ...(
                Object.assign(
                    {}, ...Object.keys(process.env).filter(o => CLIENT_CONFIG_PATTERN.test(o))
                .map(k => ({[k.replace(CLIENT_CONFIG_PATTERN, '')]: process.env[k]}))
                )
            ),
            HEADER_LOGO_URL: process.env.CLIENT_CONFIG_HEADER_LOGO_URL || '/example-logo.jpg',
            API_HOST: process.env.CLIENT_CONFIG_API_HOST || ''
        }
    };
}
module.exports = config;