import { Hono } from "hono";
import { upgradeWebSocket, WebSocketContext } from "hono/cloudflare-workers";

const app = new Hono();

app.get("/new", (c) => {
	// TODO: Create a game in the DB
	//

	const gameId = 42;
	return c.redirect(`/game/${gameId}`);
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
app.get("/:id/play", (c) => {
	return c.html(
		<div>
			<h1>Playing the game</h1>
		</div>,
	);
});

// TODO: Not sure if sending based on DB update works, maybe polling is better?
app.get(
	"/:id/subscribe",
	upgradeWebSocket((c: WebSocketContext) => {
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

export default app;
