import { useRef, useState } from "react";

// prevent characters in input type number
const exceptions = ["e", "E", "+", "-", "."];

const App = () => {
  const [users, setUsers] = useState([]);
  const [points, setPoints] = useState([]);
  const [sets, setSets] = useState([]);

  const userone = useRef();
  const useronelevel = useRef();

  const usertwo = useRef();
  const usertwolevel = useRef();


  // add users datas in state
  const setUsersData = () => {
    const user1 = {
      name: userone.current.value,
      pct: useronelevel.current.value * 10, // level of user transformed in percentage
      id: 1
    }

    const user2 = {
      name: usertwo.current.value,
      pct: usertwolevel.current.value * 10, // level of user transformed in percentage
      id: 2
    }

    // add 2 users
    setUsers([user1, user2]);
  }

  // each click, a point is added
  const addPoint = () => {

    // we expand the number of user1 and user2 based on their pct values
    // if pct of user1 is 90, there will be 90 user1
    // same for user2
    const expanded = users.flatMap(user => Array(user.pct).fill(user));
    // take the winner randomly
    const winner = expanded[Math.floor(Math.random() * expanded.length)];

    // add the winner to points
    setPoints(points => [...points, winner]);
  }

  const checkScores = async () => {

    // config for sending request to the backend
    const myInit = {
      method: 'POST',
      body: JSON.stringify(points),
      headers: {
        "Content-Type": "application/json"
      }
    };

    const data = await fetch('http://wecount-tennis-api.franckehui.fr/scores', myInit);

    // transform the data to json
    const response = await data.json();
    setSets(response);
  }

  // as I modeled the data, the current game is in the last set and the last game played 
  const lastSet = sets[sets.length - 1];
  if (lastSet) var currentGame = lastSet[lastSet.length - 1];

  // if user1 or user2 has 3 sets win, the game is finished
  if (currentGame) var gameFinished = currentGame.user1NbSetsWin === 3 || currentGame.user2NbSetsWin === 3;


  return (
    <div className="App">

      <UsersInfo users={users} />

      <Form
        setUsersData={setUsersData}
        userone={userone}
        useronelevel={useronelevel}
        usertwo={usertwo}
        usertwolevel={usertwolevel}
        users={users}
      />

      <Button text={"Ajouter un point"} action={addPoint} disabled={gameFinished} />

      <Table users={users} sets={sets} currentGame={currentGame} />

      <Button text={"Vérifier le score"} action={checkScores} />

      <RecapPoints points={points} />

    </div>
  );
}

const UsersInfo = ({ users }) => {
  return (
    <>
      {users.length > 0 && <>
        <div>{users[0].name} : {users[0].pct}</div>
        <div>{users[1].name} : {users[1].pct}</div>
      </>}
    </>
  )
}
const Form = ({ users, userone, useronelevel, usertwo, usertwolevel, setUsersData }) => {

  const keydown = (evt) => {
    exceptions.includes(evt.key) && evt.preventDefault();
  }
  
  return (
    <>
      {!users.length && <>
        <div>
          <input ref={userone} name="user1" placeholder="Utilisateur 1" />
          <input onKeyDown={(event) => keydown(event)} ref={useronelevel} name="user1level" placeholder="Niveau" type={"number"} max="10" min="1" />
        </div>

        <div style={{ marginTop: "20px" }}>
          <input ref={usertwo} name="user2" placeholder="Utilisateur 2" />
          <input onKeyDown={(event) => keydown(event)} ref={usertwolevel} name="user2level" placeholder="Niveau" type={"number"} max="10" min="1" />
        </div>

        <div style={{ marginTop: "20px" }}>
          <button onClick={setUsersData}>Go</button>
        </div>
      </>}
    </>
  )
}
const RecapPoints = ({ points }) => {
  return (<div style={{ position: "absolute", right: "10px", top: "10px", maxHeight: "200px", overflowY: "auto" }}>
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
const Button = ({ text, action, disabled }) => {
  return (
    <div style={{ marginTop: "20px" }}>
      <button disabled={disabled} onClick={action}>{text}</button>
    </div>
  )
}
const Table = ({ sets, currentGame, users }) => {
  return (
    <>
      {sets.length > 0 && <>

        {(currentGame.user1NbSetsWin < 3 && currentGame.user2NbSetsWin < 3) && <span>Jeu en cours, pas de vainqueur</span>}
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
              return <td key={index + el[el.length - 1].user1NbGamesWin}>{el[el.length - 1].user1NbGamesWin}</td>
            })}
            <td><PointConverter point={currentGame?.user1Points || 0} /></td>

          </tr>
          <tr>
            <th scope="row">{users[1].name}</th>
            {sets.map((el, index) => {
              return <td key={el[el.length - 1].user2Points + index}>{el[el.length - 1].user2NbGamesWin}</td>
            })}
            <td>
              <td><PointConverter point={currentGame?.user2Points || 0} /></td>
            </td>
          </tr>
        </table>
      </>}
    </>
  )
}

export default App;
