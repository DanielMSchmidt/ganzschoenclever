import { Context as HonoContext } from "hono";
export type Context = {
	Bindings: {
		DB: D1Database;
	};
};

export type CTX = HonoContext<Context>;
