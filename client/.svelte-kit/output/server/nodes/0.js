import * as server from '../entries/pages/_layout.server.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.js";
export const imports = ["app/immutable/nodes/0.CnCCZMT9.js","app/immutable/chunks/DsnmJJEf.js","app/immutable/chunks/B089eHam.js","app/immutable/chunks/C1nE1ELk.js"];
export const stylesheets = [];
export const fonts = [];
