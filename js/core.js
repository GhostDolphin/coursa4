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

const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const defCards = () => {
	const range = ['J', 'Q', 'K', 'A'],
	suits = [
		'heart',
		'diamond',
		'spade',
		'club'
	],
	cards = [];
	for (let i = 10; i >= 2; i--)
		range.unshift(i);
	for (const suit of suits)
		for (const val of range)
			cards.push({ suit: suit, value: val });
	return cards;
};

const shuffle = (cards) => {
	const deck = cards,
	len = cards.length;
	for (let i = 0; i < len; i++) {
		const num = getRandom(i, len - 1);
		const temp = deck[i];
		deck[i] = deck[num];
		deck[num] = temp;
	}
	return deck;
};

const findId = (id) => document.getElementById(id);
const findClass = (className) => document.getElementsByClassName(className);

const parseCardClass = (isHidden, card) => isHidden ? ` hidden` : ` ${card.suit} num${card.value}`;

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

			const newCard = findId(`card_${side}_${i}`),
			className = parseCardClass((i === 1) && (side === 'dealer') ? true : false, result.table[side][i]);

			newCard.className += className;

			setTimeout(() => {
				findId(newCard.id).style.transform = 'scale(1)';
			}, 1000 * result.counter);
		}
	}

	return result;
};

const countScore = (cards) => {
	let score = 0;

	const defVal = (checkCard) => {
		if (typeof checkCard.value !== 'number') {
			if (checkCard.value === 'A')
				return 11;
			else
				return 10;
		} else {
			return checkCard.value;
		}
	};

	const countAces = (deck) => {
		const aces = [];

		for (const ace of deck) {
			if (ace.value === 'A')
				aces.push(ace);
		}

		return aces;
	};

	for (const card of cards) {
		const val = defVal(card);

		score += val;
	}

	let aces = countAces(cards);

	if (aces.length > 0) {
		let n = 0;

		while (score > 21 && n < aces.length) {
			n++;
			score -= 10;
		}
	}

	return score;
};

const hit = (deck, playerCards) => {
	const result = {
		leftInDeck: deck,
		cards: playerCards
	};

	const card = result.leftInDeck.splice(0, 1)[0],
	newCard = document.createElement('table'),
	className = 'card' + parseCardClass(false, card),
	idOfCard = `card_player_${result.cards.length}`;

	card.id = idOfCard;
	result.cards.push(card);

	newCard.id = idOfCard;
	newCard.className += className;
	newCard.innerHTML = CARD_TEMPLATE;

	findClass('playerCards')[0].appendChild(newCard);

	setTimeout(() => {
		findId(newCard.id).style.transform = 'scale(1)';
	}, 100);

	return result;
};

const stand = (deck, dealerCards) => {
	const result = {
		leftInDeck: deck,
		cards: dealerCards
	};

	const card = result.leftInDeck.splice(0, 1)[0],
	newCard = document.createElement('table'),
	className = 'card' + parseCardClass(false, card),
	idOfCard = `card_dealer_${result.cards.length}`;

	card.id = idOfCard;
	result.cards.push(card);

	newCard.id = idOfCard;
	newCard.className += className;
	newCard.innerHTML = CARD_TEMPLATE;

	findClass('dealerCards')[0].appendChild(newCard);

	setTimeout(() => {
		findId(newCard.id).style.transform = 'scale(1)';
	}, 100);

	return result;
};

const showHidden = (cards) => {
	const cardId = findClass('hidden')[0].id,
	hiddenCard = cards.filter((card) => card.id === cardId)[0],
	className = parseCardClass(false, hiddenCard);

	findId(cardId).classList.remove('hidden');
	findId(cardId).className += className;
};

const playerLost = () => {
	findId('hit').classList.add('hidden');
	findId('stand').classList.add('hidden');
	findId('player_score').classList.add('lost');
	findId('dealer_score').classList.add('won');
};

const playerWon = () => {
	findId('hit').classList.add('hidden');
	findId('stand').classList.add('hidden');
	findId('player_score').classList.add('won');
	findId('dealer_score').classList.add('lost');
};

const draw = () => {
	findId('hit').classList.add('hidden');
	findId('stand').classList.add('hidden');
	findId('player_score').classList.remove('won');
	findId('player_score').classList.remove('lost');
	findId('dealer_score').classList.remove('won');
	findId('dealer_score').classList.remove('lost');
};

const checkMoney = (money) => {
	if (money < 1000) {
		findId('player_money').classList.remove('won');
		findId('player_money').classList.add('lost');
	} else if (money === 1000) {
		findId('player_money').classList.remove('lost');
		findId('player_money').classList.remove('won');
	} else if (money > 1000) {
		findId('player_money').classList.remove('lost');
		findId('player_money').classList.add('won');
	}
};

findId('bid').addEventListener('click', () => {
	if (!bidClicked && curStats.player.money > 0) {
		bidClicked = true;
		findId('bid').classList.add('hidden');
		findId('player_score').classList.remove('won');
		findId('player_score').classList.remove('lost');
		findId('dealer_score').classList.remove('won');
		findId('dealer_score').classList.remove('lost');

		const cardsAll = defCards(),
		curDeck = shuffle(cardsAll);

		if (continueGame) {
			findId('dealer_cards').innerHTML = '';
			findId('player_cards').innerHTML = '';
			findId('player_score').innerHTML = 0;
			findId('dealer_score').innerHTML = 0;

			for (const side in ALWAYS_FIRST) {
				for (const idOfFirst of ALWAYS_FIRST[side]) {
					const newCard = document.createElement('table');

					newCard.id = idOfFirst;
					newCard.className = 'card';
					newCard.innerHTML = CARD_TEMPLATE;

					findClass(side)[0].appendChild(newCard);
				}
			}
		}

		values = startGame(curDeck, curStats);

		curStats.player.score = countScore(values.table.player);
		curStats.player.money -= 100;
		findId('chip').innerHTML = '$100';
		findId('player_money').innerHTML = `$${curStats.player.money}`;
		checkMoney(curStats.player.money);

		curStats.dealer.score = countScore(values.table.dealer);

		setTimeout(() => {
			findId('player_score').innerHTML = curStats.player.score;
			findId('dealer_score').innerHTML = '?';

			findId('hit').classList.remove('hidden');
			findId('stand').classList.remove('hidden');

			firstDone = true;
		}, (1000 * values.counter) + 500);
	}
});

findId('hit').addEventListener('click', () => {
	if (firstDone) {
		const result = hit(values.leftInDeck, values.table.player);

		curStats.player.score = countScore(result.cards);

		setTimeout(() => {
			findId('player_score').innerHTML = curStats.player.score;

			if (curStats.player.score > 21) {
				showHidden(values.table.dealer);
				playerLost();

				findId('dealer_score').innerHTML = curStats.dealer.score;

				firstDone = false;

				if (curStats.player.money > 0) {
					findId('bid').classList.remove('hidden');
					continueGame = true;
					bidClicked = false;
				}
			}
		}, 100);
	}
});

findId('stand').addEventListener('click', () => {
	if (firstDone) {
		firstDone = false;
		setTimeout(() => {
			showHidden(values.table.dealer);
			findId('dealer_score').innerHTML = curStats.dealer.score;

			let count,
			result;

			while (curStats.dealer.score < 17) {
				count++;
				result = stand(values.leftInDeck, values.table.dealer);
				curStats.dealer.score = countScore(result.cards);
				findId('dealer_score').innerHTML = curStats.dealer.score;
			}
			
			if (curStats.dealer.score > 21) {
				playerWon();

				curStats.player.money += 200;
				findId('player_money').innerHTML = `$${curStats.player.money}`;
				checkMoney(curStats.player.money);

				findId('bid').classList.remove('hidden');
				continueGame = true;
				bidClicked = false;
			} else if (curStats.dealer.score > curStats.player.score) {
				playerLost();

				if (curStats.player.money > 0) {
					findId('bid').classList.remove('hidden');
					continueGame = true;
					bidClicked = false;
				}
			} else if (curStats.dealer.score < curStats.player.score) {
				playerWon();

				if (curStats.player.score === 21 && values.table.player.length === 2)
					curStats.player.money += 300;
				else
					curStats.player.money += 200;

				findId('player_money').innerHTML = `$${curStats.player.money}`;
				checkMoney(curStats.player.money);

				findId('bid').classList.remove('hidden');
				continueGame = true;
				bidClicked = false;
			} else if (curStats.dealer.score === curStats.player.score) {
				draw();

				curStats.player.money += 100;
				findId('player_money').innerHTML = `$${curStats.player.money}`;

				checkMoney(curStats.player.money);

				findId('bid').classList.remove('hidden');
				continueGame = true;
				bidClicked = false;
			}
		}, 100);
	}
});
