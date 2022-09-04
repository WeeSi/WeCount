const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const corsOptions = {
    origin: [
        'http://localhost:3000',
    ]
};

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public"));
app.use(express.static("public"));

app.use(bodyParser.json());

app.post('/scores', function (req, res) {
    const scores = req.body;
    let games = [];
    let sets = [];
    let user1Points = 0;
    let user2Points = 0;
    let user1NbGamesWin = 0;
    let user2NbGamesWin = 0;
    let user1NbSetsWin = 0;
    let user2NbSetsWin = 0;
    let game = 0;
    let set = 0;
    let nbPointsNecessary = 4;

    scores.map((score, index,) => {
        const currEl = score;

        if (currEl.id == 1) user1Points++;
        if (currEl.id == 2) user2Points++;

        if (user1NbGamesWin === 6 && user2NbGamesWin === 6) {
            nbPointsNecessary = 7;
        }

        if (Math.abs(user1Points - user2Points) >= 2 && (user1Points >= nbPointsNecessary || user2Points >= nbPointsNecessary)) {
            if (!games[game]) games[game] = [];

            if (user1Points > user2Points) user1NbGamesWin++;
            if (user2Points > user1Points) user2NbGamesWin++;

            if ((user1NbGamesWin > user2NbGamesWin) && (user1NbGamesWin >= 6)) user1NbSetsWin++;
            if ((user2NbGamesWin > user1NbGamesWin) && (user2NbGamesWin >= 6)) user2NbSetsWin++;

            games[game] = {
                user1Points: user1Points,
                user2Points: user2Points,
                user1NbGamesWin,
                user2NbGamesWin,
                user1NbSetsWin,
                user2NbSetsWin
            }

            game++;
            sets[set] = games;

            if (user1NbGamesWin >= 6 || user2NbGamesWin >= 6) {
                set++;
                game = 0;
                games = [];
                user2NbGamesWin = 0;
                user1NbGamesWin = 0;
            }

            user1Points = 0;
            user2Points = 0;

        }

        if ((user1Points - user2Points < 2) || (user1Points < nbPointsNecessary || user2Points < nbPointsNecessary)) {
            if (!games[game]) games[game] = [];

            games[game] = {
                user1Points: user1Points,
                user2Points: user2Points,
                user1NbGamesWin,
                user2NbGamesWin,
                user1NbSetsWin,
                user2NbSetsWin
            }

            sets[set] = games;
        }

        if (Math.abs((user1Points - user2Points)) == 1 && (user1Points >= nbPointsNecessary || user2Points >= nbPointsNecessary)) {
            if (!games[game]) games[game] = [];

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

    res.send(sets);
})

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});