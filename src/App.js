import React from 'react';
import cs from 'classnames';
import './App.css';

const SPEED = 200;
const GRID_SIZE = 50;
const GRID = [];

for (let i = 0; i <= GRID_SIZE; i++) {
  GRID.push(i);
}
const DIRECTIONS = { UP: 'UP', BOTTOM: 'BOTTOM', RIGHT: 'RIGHT', LEFT: 'LEFT', };

const KEY_CODES_MAP = { 38: 'UP', 39: 'RIGHT', 37: 'LEFT', 40: 'BOTTOM', };

const DIRECTION_TICKS = {
  UP: (x, y) => ({ x, y: y - 1 }),
  BOTTOM: (x, y) => ({ x, y: y + 1 }),
  RIGHT: (x, y) => ({ x: x + 1, y }),
  LEFT: (x, y) => ({ x: x - 1, y }),
};

const getRandomNumberFromRange = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const getRandomCoordinate = () => ({
  x: getRandomNumberFromRange(1, GRID_SIZE - 1),
  y: getRandomNumberFromRange(1, GRID_SIZE - 1),
});

const isBorder = (x, y) => x === 0 || y === 0 || x === GRID_SIZE || y === GRID_SIZE;

const isPosition = (x, y, diffX, diffY) => x === diffX && y === diffY;

const isSnake = (x, y, snakeCoordinates) => snakeCoordinates.filter(
  coordinate => isPosition(
    coordinate.x,
    coordinate.y,
    x,
    y
  )
).length;

const getSnakeHead = snake => snake.coordinates[0];

const getSnakeWithoutStub = snake => snake.coordinates.slice(0, snake.coordinates.length - 1);

const getSnakeTail = snake => snake.coordinates.slice(1);

const getIsSnakeOutside = snake => getSnakeHead(snake).x >= GRID_SIZE || getSnakeHead(snake).y >= GRID_SIZE || getSnakeHead(
  snake
).x <= 0 || getSnakeHead(snake).y <= 0;

const getIsSnakeHitsHerself = snake => isSnake(getSnakeHead(snake).x, getSnakeHead(snake).y, getSnakeTail(snake));

const getIsSnakeEating = ({ snake, food }) => isPosition(
  getSnakeHead(snake).x,
  getSnakeHead(snake).y,
  food.coordinate.x,
  food.coordinate.y
);

const getCellClassNames = (isGameOver, snake, food, x, y) => cs(
  'grid-cell',
  {
    'grid-cell-border': isBorder(x, y),
    'grid-cell-snake': isSnake(x, y, snake.coordinates),
    'grid-cell-food': isPosition(x, y, food.coordinate.x, food.coordinate.y),
    'grid-cell-hit': isGameOver && isPosition(x, y, getSnakeHead(snake).x, getSnakeHead(snake).y),
  }
);

const reducer = (state, action) => {
  switch (action.type) {
    case 'SNAKE_CHANGE_DIRECTION':
      return { ...state, payload: { ...state.payload, direction: action.direction, }, };
    case 'SNAKE_MOVE':
      const isSnakeEating = getIsSnakeEating(state);
      const snakeHead = DIRECTION_TICKS[state.payload.direction](
        getSnakeHead(state.snake).x,
        getSnakeHead(state.snake).y
      );
      const snakeTail = isSnakeEating ? state.snake.coordinates : getSnakeWithoutStub(state.snake);
      const foodCoordinate = isSnakeEating ? getRandomCoordinate() : state.food.coordinate;
      return {
        ...state,
        snake: { coordinates: [snakeHead, ...snakeTail], },
        food: { coordinate: foodCoordinate, },
        score: isSnakeEating ? state.score + 1 : state.score
      };
    case 'GAME_OVER':
      return { ...state, payload: { ...state.payload, isGameOver: true, }};
    default:
      throw new Error();
  }
};

const initialState = {
  payload: { direction: DIRECTIONS.RIGHT, isGameOver: false },
  snake: { coordinates: [getRandomCoordinate()] },
  food: { coordinate: getRandomCoordinate() },
  score: 0,
};
const App = () => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const onChangeDirection = event => {
    if (KEY_CODES_MAP[event.keyCode]) {
      dispatch({ type: 'SNAKE_CHANGE_DIRECTION', direction: KEY_CODES_MAP[event.keyCode], });
    }
  };
  React.useEffect(
    () => {
      window.addEventListener('keyup', onChangeDirection, false);
      return () => window.removeEventListener('keyup', onChangeDirection, false);
    }, []
  );
  React.useEffect(
    () => {
      const onTick = () => {
        getIsSnakeOutside(state.snake) || getIsSnakeHitsHerself(state.snake) ? dispatch({ type: 'GAME_OVER' }) : dispatch(
            { type: 'SNAKE_MOVE' }
          );
      };
      const interval = setInterval(onTick, SPEED);
      return () => clearInterval(interval);
    }, [state]
  );
  return (
    <div className="app">
      <Grid snake={state.snake} food={state.food} isGameOver={state.payload.isGameOver}/>
      <h3>Score: {state.score}</h3>
    </div>
  );
};
const Grid = ({ isGameOver, snake, food }) => (
  <div>
    {GRID.map(y => (<Row y={y} key={y} snake={snake} food={food} isGameOver={isGameOver}/>))}
  </div>
);

const Row = ({ isGameOver, snake, food, y }) => (
  <div className="grid-row">
    {GRID.map(x => (<Cell x={x} y={y} key={x} snake={snake} food={food} isGameOver={isGameOver}/>     ))}
  </div>
);

const Cell = ({ isGameOver, snake, food, x, y }) => (
  <div className={getCellClassNames(isGameOver, snake, food, x, y)}/>
);

export default App; 
