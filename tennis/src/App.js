import { useRef, useState } from "react";

const exceptions = ["e", "E", "+", "-", "."];


const App = () => {
  const [users, setUsers] = useState([]);
  const [points, setPoints] = useState([]);
  const [sets, setSets] = useState([]);

  const userone = useRef();
  const useronelevel = useRef();

  const usertwo = useRef();
  const usertwolevel = useRef();


  const setUsersData = () => {
    const user1 = {
      name: userone.current.value,
      pct: useronelevel.current.value * 10,
      id: 1
    }

    const user2 = {
      name: usertwo.current.value,
      pct: usertwolevel.current.value * 10,
      id: 2
    }

    setUsers([user1, user2]);
  }

  const addPoint = () => {
    const expanded = users.flatMap(user => Array(user.pct).fill(user));
    const winner = expanded[Math.floor(Math.random() * expanded.length)];

    setPoints(points => [...points, winner]);
  }

  const checkScores = async () => {
    const myInit = {
      method: 'POST',
      body: JSON.stringify(points),
      headers: {
        "Content-Type": "application/json"
      }
    };
    const data = await fetch('http://localhost:8000/scores', myInit);
    const response = await data.json();
    setSets(response);
  }

  const lastSet = sets[sets.length - 1];
  if(lastSet) var currentGame = lastSet[lastSet.length - 1];

  if(currentGame) var gameFinished = currentGame.user1NbSetsWin === 3 || currentGame.user2NbSetsWin === 3;

  console.log(gameFinished);

  return (
    <div className="App">

      {users.length > 0 && <>
        <div>{users[0].name} : {users[0].pct}</div>
        <div>{users[1].name} : {users[1].pct}</div>
      </>}


      {!users.length && <>
        <div>
          <input ref={userone} name="user1" placeholder="Utilisateur 1" />
          <input onKeyDown={(event) => exceptions.includes(event.key) && event.preventDefault()} ref={useronelevel} name="user1level" placeholder="Niveau" type={"number"} max="10" min="1" />
        </div>

        <div style={{ marginTop: "20px" }}>
          <input ref={usertwo} name="user2" placeholder="Utilisateur 2" />
          <input onKeyDown={(event) => exceptions.includes(event.key) && event.preventDefault()} ref={usertwolevel} name="user2level" placeholder="Niveau" type={"number"} max="10" min="1" />
        </div>


        <div style={{ marginTop: "20px" }}>
          <button onClick={setUsersData}>Go</button>
        </div>
      </>}

      <div style={{ marginTop: "20px" }}>
        <button disabled={gameFinished} onClick={addPoint}>add point</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={checkScores}>Scores</button>
      </div>

      {sets.length > 0 && <>
      
      {(currentGame.user1NbSetsWin < 3 && currentGame.user2NbSetsWin < 3) && <span>Jeu en cours, pas de vainqueur</span> }
      {currentGame.user1NbSetsWin === 3 && <span>Jeu fini, Vainqueur: {users[0].name} {users[0].pct} </span>}
      {currentGame.user2NbSetsWin === 3 && <span>Jeu fini, Vainqueur: {users[1].name} {users[1].pct}</span>}

        <table>
          <tr>
            <td></td>
            {sets.map((el, index) => {
              return <th key={`set ${index + 1}`}>Set {index + 1}</th>
            })}
            <th>Current Game</th>
          </tr>
          <tr>
            <th scope="row">{users[0].name}</th>
            {sets.map((el, index) => {
              return <td>{el[el.length - 1].user1NbGamesWin}</td>
            })}
            <td><PointConverter point={currentGame?.user1Points || 0} /></td>

          </tr>
          <tr>
            <th scope="row">{users[1].name}</th>
            {sets.map((el, index) => {
              return <td key={el[el.length - 1].user2Points}>{el[el.length - 1].user2NbGamesWin}</td>
            })}
            <td>
              <td><PointConverter point={currentGame?.user2Points || 0} /></td>
            </td>
          </tr>
        </table>
      </>}

      <RecapPoints points={points} />

    </div>
  );
}

const RecapPoints = ({ points }) => {
  return (<div style={{ position: "absolute", right: "10px", top: "10px", maxHeight: "200px", overflowY:"auto" }}>
    {points.length > 0 &&
      <>
        {points.map((point, index) => {
          return (<div key={index + point.name}>Point {index + 1} : Remporté par [{point.name}]</div>)
        })}
      </>
    }
  </div>
  )
}

const PointConverter = ({ point }) => {
  switch (point) {
    case 0: return 0;

    case 1: return 15;

    case 2: return 30;

    case 3: return 40;

    case '-': return '-';

    case 'AV': return 'AV';

    default: return 40;
  }
}

export default App;
