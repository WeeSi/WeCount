const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://wecount-tennis.franckehui.fr'
    ]
};

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public"));
app.use(express.static("public"));

app.use(bodyParser.json());

app.post('/scores', function (req, res) {

    // we take the scores from the body of the respone as it is a post request
    const scores = req.body;

    // init variables
    let games = []; // the total of games played
    let sets = []; // the total of sets
    let user1Points = 0; // the user1 points of a game
    let user2Points = 0; // the user2 points of a game
    let user1NbGamesWin = 0; // the number of games win from user1 in a set
    let user2NbGamesWin = 0; // the number of games win from user2 in a set
    let user1NbSetsWin = 0; // the number of sets win from user1
    let user2NbSetsWin = 0; // the number of sets win from user2
    let game = 0; //the number of game
    let set = 0; // the number of set
    let nbPointsNecessary = 4; // the number of point necessary in a game
    let gamesToWin = 6; // the number of game win in a set
    let gameIsWin = false;

    //loop through scores
    scores.map((score) => {
        const currEl = score; // the current score

        // if all sets have been won
        if(user1NbSetsWin === 3 || user2NbSetsWin === 3){
            gameIsWin = true; 
            return;
        } 

        // add point to the user based on score id
        if (currEl.id == 1) user1Points++;
        if (currEl.id == 2) user2Points++;

        // if the number of game win from user 1 and user 2 equal to 6
        // the number of point necessary is 7
        if (user1NbGamesWin === 6 && user2NbGamesWin === 6) {
            nbPointsNecessary = 7;
        }
 
        // if there is a difference of 2 or more and
        // the number of point from user 1 or 2 is greater or equal to the necessary point
        if (Math.abs(user1Points - user2Points) >= 2 && (user1Points >= nbPointsNecessary || user2Points >= nbPointsNecessary)) {
            // the game is win in this scope

            if (!games[game]) games[game] = []; // create an array for each game

            // increment the number of game win
            if (user1Points > user2Points) user1NbGamesWin++;
            if (user2Points > user1Points) user2NbGamesWin++;

            // if one game win difference between the 2 players
            if((user1NbGamesWin === 5 && user2NbGamesWin === 6) || (user1NbGamesWin === 6 && user2NbGamesWin === 5)){
                gamesToWin = 7;
            }

            // increment the number of set win for the player
            if ((user1NbGamesWin > user2NbGamesWin) && (user1NbGamesWin >= gamesToWin)) user1NbSetsWin++;
            if ((user2NbGamesWin > user1NbGamesWin) && (user2NbGamesWin >= gamesToWin)) user2NbSetsWin++;

            // object of the result
            games[game] = {
                user1Points: user1Points,
                user2Points: user2Points,
                user1NbGamesWin,
                user2NbGamesWin,
                user1NbSetsWin,
                user2NbSetsWin
            }

            // increment the game
            game++;

            // add games to the sets array
            sets[set] = games;

            // if 7 game win is needed to win the set
            if(gamesToWin === 7 && (user1NbGamesWin >= gamesToWin || user2NbGamesWin >= gamesToWin) ){
                set++; // increment the set

                // reinitialize the values
                game = 0;
                gamesToWin = 6;
                games = [];
                user2NbGamesWin = 0;
                user1NbGamesWin = 0;
            }

            // if 6 games win is needed to win the set and there is a difference of 2 between the game win of the 2 players
            if ((user1NbGamesWin >= gamesToWin || user2NbGamesWin >= gamesToWin) && (Math.abs(user1NbGamesWin - user2NbGamesWin)>=2) && gamesToWin === 6) {
                set++; // increment the set

                // reinitialize the values
                game = 0;
                gamesToWin = 6;
                games = [];
                user2NbGamesWin = 0;
                user1NbGamesWin = 0;
            }

            user1Points = 0;
            user2Points = 0;

        }

        // if there is a difference smaller than 2 and the points of the 2 players are smaller than the necessary
        if ((user1Points - user2Points < 2) || (user1Points < nbPointsNecessary || user2Points < nbPointsNecessary)) {
            if (!games[game]) games[game] = [];

            // object of the result
            games[game] = {
                user1Points: user1Points, //0,15,30,40
                user2Points: user2Points, //0,15,30,40
                user1NbGamesWin,
                user2NbGamesWin,
                user1NbSetsWin,
                user2NbSetsWin
            }

            //add the games to the set
            sets[set] = games;
        }

        // if there is a equality of point
        if (Math.abs((user1Points - user2Points)) == 1 && (user1Points >= nbPointsNecessary || user2Points >= nbPointsNecessary)) {
            //Aventage of a user in this scope

            if (!games[game]) games[game] = [];

            // object of the result
            games[game] = {
                user1Points: user1Points > user2Points ? 'AV' : '-',
                user2Points: user2Points > user1Points ? 'AV' : '-',
                user1NbGamesWin,
                user2NbGamesWin,
                user1NbSetsWin,
                user2NbSetsWin,
                AV: true
            }

            sets[set] = games;

        }
    });

    if(gameIsWin) delete sets.splice(-1);
    //send the result
    res.send(sets);
})

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});