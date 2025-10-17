import * as server from '../entries/pages/_layout.server.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.js";
export const imports = ["app/immutable/nodes/0.DeLdXBmL.js","app/immutable/chunks/DsnmJJEf.js","app/immutable/chunks/BGMrN2PN.js","app/immutable/chunks/DWTkkB4o.js"];
export const stylesheets = [];
export const fonts = [];
