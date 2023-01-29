import { shuffle } from '../utils';
import { Game } from './game.model';
import { Vote } from './voting.model';

export class Room {
  id: string;
  hostName: string;
  clients: { playerId: string; playerName: string; playerProfile: string }[];
  game: Game;
  profiles = [
    'players/player-1.png',
    'players/player-2.png',
    'players/player-3.png',
    'players/player-4.png',
    'players/player-5.png',
    'players/player-6.png',
    'players/player-7.png',
    'players/player-8.png',
    'players/player-9.png',
    'players/player-11.png',
    'players/player-12.png',
    'players/player-13.png',
    'players/player-14.png',
    'players/player-15.png',
    'players/player-16.png',
    'players/player-17.png',
    'players/player-18.png',
    'players/player-19.png'
  ];
  votes: { playerId: string; vote: Vote }[];
  selectedPlayerVotes: { playerId: string; selectedPlayerId: string }[];

  constructor({ id, hostName }: { id: string; hostName: string }) {
    this.id = id;
    this.hostName = hostName;
    this.clients = [];
    this.game = new Game({
      numberOfPlayers: 0,
      players: [],
      playerInTurn: '',
      playerAsPresident: '',
      turnsPlayed: 0,
      roundsPlayed: 0,
      roundsForNextElections: 0,
      governmentPlayers: [],
      oppositionPlayers: [],
      deck: [],
      approvedLaws: [],
      blockedPlayers: []
    });
    this.votes = [];
    this.selectedPlayerVotes = [];
  }

  newClientJoined(playerId: string, playerName: string) {
    const client = {
      playerId,
      playerName,
      playerProfile: ''
    };
    this.clients.push(client);
    return playerId;
  }

  removeClient(playerId: string) {
    const client = this.clients.find((client) => client.playerId === playerId);
    if (!client) return;

    if (client.playerProfile) this.profiles.push(client.playerProfile);
    this.clients = this.clients.filter((c) => c.playerId !== client.playerId);
    if (client.playerName === this.hostName && this.clients.length > 0)
      this.hostName = this.clients[0].playerName;
  }

  setClientProfile(playerId: string, playerProfile: string) {
    this.clients.forEach((client) => {
      if (client.playerId === playerId) client.playerProfile = playerProfile;
    });
  }

  getClientProfile(playerId: string) {
    return this.clients.find((client) => client.playerId === playerId).playerProfile;
  }

  getNewRandomProfile() {
    const profile = shuffle(this.profiles)[0];
    this.profiles = this.profiles.filter((p) => p !== profile);
    return profile;
  }

  collectVote(playerId: string, vote: Vote) {
    this.votes.push({ playerId, vote });
  }

  countVotes(): boolean {
    let yes = 0;
    let no = 0;
    this.votes.forEach((vote) => {
      if (vote.vote === 'YES') yes++;
      else if (vote.vote === 'NO') no++;
    });
    this.votes = [];
    return yes >= no;
  }

  collectSelectedPlayerVote(playerId: string, selectedPlayerId: string) {
    this.selectedPlayerVotes.push({ playerId, selectedPlayerId });
  }

  countSelectedPlayerVotes(): string | undefined {
    const counts = {};
    const selectedPlayers = this.selectedPlayerVotes.map((vote) => vote.selectedPlayerId);
    selectedPlayers.forEach(function (playerId) {
      if (!playerId) return;
      counts[playerId] = (counts[playerId] || 0) + 1;
    });
    let mostVotedPlayer: string;
    let voteCount = 0;
    Object.keys(counts).forEach((playerId) => {
      if (counts[playerId] > voteCount) {
        mostVotedPlayer = playerId;
        voteCount = counts[playerId];
      }
    });
    this.selectedPlayerVotes = [];
    if (mostVotedPlayer && voteCount >= Math.ceil(this.clients.length / 2)) return mostVotedPlayer;
    return;
  }

  setGame(game: Game) {
    this.game = game;
  }
}
