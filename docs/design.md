# Think Alike! Design

## Introduction
Think Alike! is a multiplayer game where players are pitted against each other. 
The goal: to think like their peers.
Players are presented with a random word and are tasked to submit a word that matches the response of The Pedestal, a rotating role. 
Players gain more points if they are the first person to match The Pedestal's answer. 
The Pedestal gains points based on the number of player's who matched their answer.
The player who knows the others the most is certain to have an advantage!

## The Game Overview

### Terminology

The Pedestal
: A newly chosen player every round. The other player's attempt to match The Pedestal's answer.

The Word
: A random word that is shown to every player, who then must quickly submit an answer they think of.

Answer
: A player's response to The Word.

### Round Phases
The game will consist of consecutive rounds.
Each round will have distinct round phases as detailed:

1. Preview Phase
    - Duration: 5s
    - The Pedestal is assigned and revealed. 
2. Answer Phase
    - Duration: 5s, configurable
    - The Word is revealed.
    - All players are prompted a text box to submit their Answer.
3. End Phase
    - Duration: until all players are ready 
    - All Answers are shown. 
    - Points are totaled and updated. 
    - Players are prompted a ready button.
    - Spectators are moved into the game. 

## System Design Overview
The application's system contains two moving parts: a backend and a frontend.
The two servers will communicate primarily through WebSockets, although will also communicate through HTTP requests for some setup endpoints. 

### Communication Between Backend/Frontend
As mentioned, there are some necessary HTTP requests that must be implemented. 
We detail them now:

```http request
POST /api/game/create
    body {
        username: string
        mode: string
    }

POST /api/game/join
    body {
        username: string
        code: string
    }
```

`/create` will:
1. create a new game instance
2. upgrade the connection
3. add the connection as the host.

`/join` will:
1. fetch the game instance
2. check for username availability
3. upgrade the connection
4. add the connection as a player

The primary communication protocol will be WebSockets. 

From client to server:
```go
// 'answer'
type Answer = string

// 'ready'
// just the message
```

From server to room:
```go
// 'player/join`
type Game

// 'player/leave'
type Game

// 'player/ready'
type PlayerName = string

// 'phase/preview'
type PedestalUsername = string

// 'phase/answer'
type WordValue = string

// 'phase/reveal'
type Game // maybe truncated
```

## Implementation

### Game
The game struct contains references to all players, the Pedestal rotation, scoring, and other information. 
For future proofing, we also create a game interface. 

```go
type Game interface {
    addPlayer(username string, socket WebSocket)
    removePlayer(player Player)
    readyPlayer(player Player)
    usernameExists(username string) bool
    // ...
}

type BaseGame struct {
    code       string
    host       Player
    players    []Player
    spectators []Player
```

```go
type basePlayer struct {
   Username string `json:"username"`
   Answer   string `json:"answer"`
}
```

## Future Proofing

### System Design
A database can be used to store game statistics, account creation, leaderboards, etc. 
A REST API must be designed to support the additional dataflow. 
