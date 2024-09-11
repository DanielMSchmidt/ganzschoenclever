import { Hono } from "hono";
import { Context } from "../types";

const app = new Hono<Context>();
app.get("/", (c) =>
	c.html(
		<div>
			<h1>Hello, let's play!</h1>

			<a href="/game/new">Create a new game</a>
		</div>,
	),
);

export default app;
