import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// We use Loro (CRDTs) for the states, so the data is just a Uint8Array
export type StateData = Uint8Array;

export const games = sqliteTable("games", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	state: blob("data").$type<StateData>().notNull(),
});

// Users in our case are always connected to a single game
export const users = sqliteTable("users", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	gameId: integer("game_id", { mode: "number" }).notNull(),
});

export const gamesRelations = relations(games, ({ many }) => ({
	users: many(users),
}));

export const usersRelations = relations(users, ({ one }) => ({
	game: one(games, {
		fields: [users.gameId],
		references: [games.id],
	}),
}));
