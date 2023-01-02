import { random, shuffle } from '../utils';
import { Card, Game, PartialGame } from '../models';
import { DeckService } from './deck.service';
import { Room } from 'src/models/room.model';

export class GameService {
  static setGame(room: Room, partialGame: PartialGame) {
    const newGame = { ...room.game, ...partialGame };
    room.setGame(newGame);
  }

  static async setup(playersIds: string[]) {
    const deck = await DeckService.new();

    const gpOne = random<string>(playersIds);
    const gpTwo = random<string>(playersIds.filter((id) => id !== gpOne));
    const governmentPlayers = [gpOne, gpTwo];

    const oppositionPlayers = playersIds.filter((id) => id !== gpOne && id !== gpTwo);

    const playerAsPresident = random<string>(playersIds);

    const presidentIndex = (playersIds as string[]).findIndex(
      (playerId) => playerId === playerAsPresident
    );

    const firstPlayerIndex = presidentIndex + 1 === playersIds.length ? 0 : presidentIndex + 1;
    const playerInTurn = playersIds[firstPlayerIndex];

    return {
      deck: shuffle<Card>(deck),
      playerInTurn,
      playerAsPresident,
      governmentPlayers,
      oppositionPlayers
    };
  }

  static updateDeckAfterDraw(game: Game, cardsDrawn: Card[]) {
    game.deck.forEach((cardInDeck) => {
      cardsDrawn.forEach((cardDrawn) => {
        if (cardInDeck === cardDrawn) cardInDeck.inDeck = false;
      });
    });
  }

  static endTurn(room: Room) {
    const game = room.game;
    const playersIds = game.playersIds;
    const playerIndex = playersIds.findIndex((id) => id === game.playerInTurn);

    const nextPlayerIndex = playerIndex + 1 === playersIds.length ? 0 : playerIndex + 1;
    const playerInTurn = playersIds[nextPlayerIndex];

    const turnsPlayed = game.turnsPlayed + 1;
    const roundsPlayed =
      turnsPlayed % game.numberOfPlayers === 0 ? this.endRound(game) : game.roundsPlayed;

    this.setGame(room, { ...game, playerInTurn, turnsPlayed, roundsPlayed });
  }

  static endRound(game: Game) {
    const roundsPlayed = game.roundsPlayed + 1;

    const roundsForNextElections = game.roundsForNextElections - 1;

    game.roundsForNextElections = roundsForNextElections <= 0 ? 4 : roundsForNextElections;

    return roundsPlayed;
  }
}
