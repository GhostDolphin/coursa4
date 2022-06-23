'use strict';

const CARD_TEMPLATE = `<tr class="up num"><td><span></span></td></tr><tr class="up suit"><td><span></span></td></tr><tr class="mid"><td></td></tr><tr class="down suit"><td><span></span></td></tr><tr class="down num"><td><span></span></td></tr>`;

const ALWAYS_FIRST = {
	dealerCards: ['card_dealer_0', 'card_dealer_1'],
	playerCards: ['card_player_0', 'card_player_1']
};

const curStats = {
	player: {
		score: 0,
		money: 1000
	},
	dealer: {
		score: 0
	}
};

let bidClicked = false,
continueGame = false,
firstDone = false,
values;



// CONVENIENCE FUNCTIONS \\

const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const defCards = () => {
	const range = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'],
	suits = [
		'heart',
		'diamond',
		'spade',
		'club'
	],
	costs = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11],
	cards = suits.flatMap(suit => range.map((value, id) => ({
		suit,
		value,
		cost: costs[id]
	})));

	return cards;
};

const shuffle = cards => cards.sort(() => Math.random() > 0.5 ? 1 : -1);

const parseCardClass = (isHidden, card) => isHidden ? ` hidden` : ` ${card.suit} num${card.value}`;



// BASIC FUNCTIONS \\

const startGame = (deck, stats) => {
	const result = {
		leftInDeck: deck,
		table: {
			player: [],
			dealer: []
		},
		counter: 0
	};


	for (let i = 0; i < 2; i++) {
		for (const side in result.table) {
			result.counter++;
			result.table[side].push(...result.leftInDeck.splice(0, 1));
			result.table[side][result.table[side].length - 1].id = `card_${side}_${i}`;

			const newCard = document.getElementById(`card_${side}_${i}`),
			className = parseCardClass((i === 1) && (side === 'dealer') ? true : false, result.table[side][i]);

			newCard.className += className;

			setTimeout(() => {
				document.getElementById(newCard.id).style.transform = 'scale(1)';
			}, 1000 * result.counter);
		}
	}

	return result;
};

const countScore = cards => {
	const sorted = cards.sort((card) => card.value === 'A' ? 1 : -1);

	const aces = cards.filter(ace => ace.value === 'A');

	const result = sorted.reduce((score, card) => {
		const isMinorAce = card.value === 'A' &&  (score + card.cost) > 21;
		const cost = isMinorAce ? 1 : card.cost;
		return score + cost;
	}, 0);

	return result;
};

const action = (deck, cards, section) => {
	const result = {
		leftInDeck: deck,
		cards: cards
	};

	const [card, ...leftInDeckCards] = result.leftInDeck,
	newCard = document.createElement('table'),
	className = 'card' + parseCardClass(false, card),
	idOfCard = `card_${section}_${result.cards.length}`;

	result.leftInDeck = leftInDeckCards;
	card.id = idOfCard;
	result.cards.push(card);

	newCard.id = idOfCard;
	newCard.className += className;
	newCard.innerHTML = CARD_TEMPLATE;

	document.getElementsByClassName(`${section}Cards`)[0].appendChild(newCard);

	setTimeout(() => {
		newCard.style.transform = 'scale(1)';
	}, 100);

	return result;
};



// DOM-OPERATING FUNCTIONS \\

const showHidden = cards => {
	const cardId = document.getElementsByClassName('hidden')[0].id,
	hiddenCard = cards.filter((card) => card.id === cardId)[0],
	className = parseCardClass(false, hiddenCard);

	document.getElementById(cardId).classList.remove('hidden');
	document.getElementById(cardId).className += className;
};

const playerLost = () => {
	document.getElementById('hit').classList.add('hidden');
	document.getElementById('stand').classList.add('hidden');
	document.getElementById('player_score').classList.add('lost');
	document.getElementById('dealer_score').classList.add('won');
};

const playerWon = () => {
	document.getElementById('hit').classList.add('hidden');
	document.getElementById('stand').classList.add('hidden');
	document.getElementById('player_score').classList.add('won');
	document.getElementById('dealer_score').classList.add('lost');
};

const draw = () => {
	document.getElementById('hit').classList.add('hidden');
	document.getElementById('stand').classList.add('hidden');
	document.getElementById('player_score').classList.remove('won');
	document.getElementById('player_score').classList.remove('lost');
	document.getElementById('dealer_score').classList.remove('won');
	document.getElementById('dealer_score').classList.remove('lost');
};

const checkMoney = money => {
	if (money < 1000) {
		document.getElementById('player_money').classList.remove('won');
		document.getElementById('player_money').classList.add('lost');
	} else if (money === 1000) {
		document.getElementById('player_money').classList.remove('lost');
		document.getElementById('player_money').classList.remove('won');
	} else if (money > 1000) {
		document.getElementById('player_money').classList.remove('lost');
		document.getElementById('player_money').classList.add('won');
	}
};



// EVENTS \\

document.getElementById('bid').addEventListener('click', () => {
	if (!bidClicked && curStats.player.money > 0) {
		bidClicked = true;
		document.getElementById('bid').classList.add('hidden');
		document.getElementById('player_score').classList.remove('won');
		document.getElementById('player_score').classList.remove('lost');
		document.getElementById('dealer_score').classList.remove('won');
		document.getElementById('dealer_score').classList.remove('lost');

		const cardsAll = defCards(),
		curDeck = shuffle(cardsAll);

		if (continueGame) {
			document.getElementById('dealer_cards').innerHTML = '';
			document.getElementById('player_cards').innerHTML = '';
			document.getElementById('player_score').innerHTML = 0;
			document.getElementById('dealer_score').innerHTML = 0;

			for (const side in ALWAYS_FIRST) {
				for (const idOfFirst of ALWAYS_FIRST[side]) {
					const newCard = document.createElement('table');

					newCard.id = idOfFirst;
					newCard.className = 'card';
					newCard.innerHTML = CARD_TEMPLATE;

					document.getElementsByClassName(side)[0].appendChild(newCard);
				}
			}
		}

		values = startGame(curDeck, curStats);

		curStats.player.score = countScore(values.table.player);
		curStats.player.money -= 100;
		document.getElementById('chip').innerHTML = '$100';
		document.getElementById('player_money').innerHTML = `$${curStats.player.money}`;
		checkMoney(curStats.player.money);

		curStats.dealer.score = countScore(values.table.dealer);

		setTimeout(() => {
			document.getElementById('player_score').innerHTML = curStats.player.score;
			document.getElementById('dealer_score').innerHTML = '?';

			document.getElementById('hit').classList.remove('hidden');
			document.getElementById('stand').classList.remove('hidden');

			firstDone = true;
		}, (1000 * values.counter) + 500);
	}
});

document.getElementById('hit').addEventListener('click', () => {
	if (firstDone) {
		const result = action(values.leftInDeck, values.table.player, 'player');

		curStats.player.score = countScore(result.cards);

		setTimeout(() => {
			document.getElementById('player_score').innerHTML = curStats.player.score;

			if (curStats.player.score > 21) {
				showHidden(values.table.dealer);
				playerLost();

				document.getElementById('dealer_score').innerHTML = curStats.dealer.score;

				firstDone = false;

				if (curStats.player.money > 0) {
					document.getElementById('bid').classList.remove('hidden');
					continueGame = true;
					bidClicked = false;
				}
			}
		}, 100);
	}
});

document.getElementById('stand').addEventListener('click', () => {
	if (firstDone) {
		firstDone = false;
		setTimeout(() => {
			showHidden(values.table.dealer);
			document.getElementById('dealer_score').innerHTML = curStats.dealer.score;

			let count,
			result;

			while (curStats.dealer.score < 17) {
				count++;
				result = action(values.leftInDeck, values.table.dealer, 'dealer');
				curStats.dealer.score = countScore(result.cards);
				document.getElementById('dealer_score').innerHTML = curStats.dealer.score;
			}
			
			if (curStats.dealer.score > 21) {
				playerWon();

				curStats.player.money += 200;
				document.getElementById('player_money').innerHTML = `$${curStats.player.money}`;
				checkMoney(curStats.player.money);

				document.getElementById('bid').classList.remove('hidden');
				continueGame = true;
				bidClicked = false;
			} else if (curStats.dealer.score > curStats.player.score) {
				playerLost();

				if (curStats.player.money > 0) {
					document.getElementById('bid').classList.remove('hidden');
					continueGame = true;
					bidClicked = false;
				}
			} else if (curStats.dealer.score < curStats.player.score) {
				playerWon();

				if (curStats.player.score === 21 && values.table.player.length === 2)
					curStats.player.money += 300;
				else
					curStats.player.money += 200;

				document.getElementById('player_money').innerHTML = `$${curStats.player.money}`;
				checkMoney(curStats.player.money);

				document.getElementById('bid').classList.remove('hidden');
				continueGame = true;
				bidClicked = false;
			} else if (curStats.dealer.score === curStats.player.score) {
				draw();

				curStats.player.money += 100;
				document.getElementById('player_money').innerHTML = `$${curStats.player.money}`;

				checkMoney(curStats.player.money);

				document.getElementById('bid').classList.remove('hidden');
				continueGame = true;
				bidClicked = false;
			}
		}, 100);
	}
});
