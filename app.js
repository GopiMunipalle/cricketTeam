const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//Get players

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT 
        *
    FROM 
        cricket_team
    ORDER BY
        player_id;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray);
});

//post player

app.post("/players/", async (request, response) => {
  const playerDeatials = request.body;
  const { playerName, jerseyNumber, role } = playerDeatials;
  const addPlayerQuery = `
    INSERT INTO
        cricket_team (player_name,jersey_number,role)
    VALUES 
        ( '${playerName}',
           ${jerseyNumber},
           '${role}');`;
  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//Get player

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
    SELECT 
       *
    FROM
        cricket_team
    WHERE 
        player_id = ${playerId};`;
  const playerArray = await db.get(getPlayer);
  response.send(playerArray);
});

//update player

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const updatePlayerDetails = request.body;
  const { playerName, jerseyNumber, role } = updatePlayerDetails;
  const updatePlayerQuery = `
    UPDATE
        cricket_team
    SET 
        player_name='${playerName}',
        jersey_number=${jerseyNumber},
        role='${role}'
    WHERE 
        player_id=${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//Delete player

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM
        cricket_team
    WHERE player_id=${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
