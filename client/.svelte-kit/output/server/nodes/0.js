import * as server from '../entries/pages/_layout.server.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.js";
export const imports = ["app/immutable/nodes/0.ChT4aC1l.js","app/immutable/chunks/DsnmJJEf.js","app/immutable/chunks/BkHzRi2O.js","app/immutable/chunks/BOGb0i0E.js"];
export const stylesheets = [];
export const fonts = [];
