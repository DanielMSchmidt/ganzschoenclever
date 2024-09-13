import { Hono } from "hono";
import { Loro } from "loro-crdt";
import { upgradeWebSocket, serveStatic } from "hono/cloudflare-workers";
import manifest from "__STATIC_CONTENT_MANIFEST";
import { createNewGame } from "../state";
import { getDB } from "../db/query";
import { games } from "../db/schema";
import { Context } from "../types";
import {} from "hono/cloudflare-workers";

const app = new Hono<Context>();

app.get("/new", async (c) => {
	const db = getDB(c);
	const game = await db
		.insert(games)
		.values({
			state: createNewGame().exportSnapshot(),
		})
		.returning();

	return c.redirect(`/game/${game[0].id}`);
});
app.get("/:id", (c) => {
	// TODO: Navigating here should create a new player if the player is not already in the game
	// For this we need to store the users id in local storage and check it here?
	return c.html(
		<div>
			<h1>Waiting for all players to join...</h1>
			<p>Please send this link to your friends to join the game</p>
			<code>{c.req.url}</code>

			<p>Once everyone joins, you can start the game</p>
			<a href={`${c.req.url}/play`}>Start the game</a>
		</div>,
	);
});

// TODO: I think the game needs to be a frontend UI so we can subscribe to the ws endpoint properly
// Maybe deliver a separate app somehow
// Also see https://hono.dev/docs/guides/rpc
app.get("/:id/play/*", serveStatic({ root: "./", manifest }));

// TODO: Not sure if sending based on DB update works, maybe polling is better?
app.get(
	"/:id/subscribe",
	upgradeWebSocket((c) => {
		// TODO: Subscribe to the game state
		let wsCtx;

		return {
			onOpen(event, ws) {
				console.log("Connection opened");
				// TODO: Load state and send it to the client
				wsCtx = ws; // Save the websocket context for later
			},
			onMessage(event, ws) {
				console.log(`Message from client: ${event.data}`);
				ws.send("Hello from server!");
			},
			onClose: () => {
				console.log("Connection closed");
			},
		};
	}),
);

// Alternative to the websockets we could do a polling endpoint
app.get("/:id/updates/", async (c) => {
	const id = parseInt(c.req.param("id"), 10);
	const db = getDB(c);
	const game = await db.query.games.findFirst({
		where: (users, { eq }) => eq(users.id, id),
	});
	if (!game) {
		return c.notFound();
	}

	const gameState = new Loro();
	gameState.import(game.state);

	const startQuery = c.req.query("start");
	let versionVector: any = undefined;
	if (startQuery) {
		versionVector = JSON.parse(decodeURIComponent(startQuery));
	}

	return c.json(gameState.exportJsonUpdates(versionVector));
});

export default app;
