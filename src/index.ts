import { Hono } from "hono";
import Start from "./routes/start";
import Game from "./routes/game";
const app = new Hono();

app.get("/", (c) => c.redirect("/start"));
app.route("/start", Start);
app.route("/game", Game);

export default app;
