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

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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



// SIMPLIFYING FUNCTIONS \\

const setScore = (stats, side, type) => { document.getElementById(`${side}_score`).innerHTML = stats[side].score };

const setMoney = stats => { document.getElementById(`player_money`).innerHTML = `$${stats.player.money}` };

const finishGame = result => {
	document.querySelector('.playboard').classList.add('finished');
	document.querySelector('.playboard').classList.add(result);
};


// DOM-OPERATING FUNCTIONS \\

const resetVisuals = () => {
	document.querySelector('.playboard').classList.remove('finished');
	document.querySelector('.playboard').classList.remove('playerLost');
	document.querySelector('.playboard').classList.remove('dealerLost');
	document.querySelector('.playboard').classList.remove('draw');
}

const resetBid = () => {
	document.getElementById('dealer_cards').innerHTML = '';
	document.getElementById('player_cards').innerHTML = '';
	document.getElementById('player_score').innerHTML = 0;
	document.getElementById('dealer_score').innerHTML = 0;
}

const showHidden = cards => {
	const hidCard = document.querySelector('.card.hidden'),
	hiddenCard = cards.filter((card) => card.id === hidCard.id)[0],
	className = parseCardClass(false, hiddenCard);

	hidCard.classList.remove('hidden');
	hidCard.className += className;
};

const checkMoney = money => {
	const { classList } = document.getElementById('player_money');

	if (money < 1000) {
		classList.remove('won');
		classList.add('lost');
	} else if (money === 1000) {
		classList.remove('lost', 'won');
	} else if (money > 1000) {
		classList.remove('lost');
		classList.add('won');
	}
};



// EVENTS \\

document.getElementById('bid').addEventListener('click', async () => {
	if (!bidClicked && curStats.player.money > 0) {
		bidClicked = true;

		resetVisuals();

		const cardsAll = defCards(),
		curDeck = shuffle(cardsAll);

		if (continueGame) {
			resetBid();

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
		setMoney(curStats);
		checkMoney(curStats.player.money);

		curStats.dealer.score = countScore(values.table.dealer);

		await delay((1000 * values.counter) + 500);

		setScore(curStats, 'player');
		setScore({dealer: {score: '?'}}, 'dealer');

		document.querySelector(".playboard").classList.remove('finished');

		firstDone = true;
	}
});

document.getElementById('hit').addEventListener('click', async () => {
	if (!firstDone) {
		return false;
	}

	const result = action(values.leftInDeck, values.table.player, 'player');
	values = {
	...values,
	...result
	};

	curStats.player.score = countScore(result.cards);

	await delay(100);

	setScore(curStats, 'player');

	if (curStats.player.score > 21) {
		showHidden(values.table.dealer);
		
		finishGame('playerLost');

		setScore(curStats, 'dealer');

		firstDone = false;

		if (curStats.player.money > 0) {
			document.getElementById('bid').classList.remove('hidden');
			continueGame = true;
			bidClicked = false;
		}
	}
});

document.getElementById('stand').addEventListener('click', async () => {
	if (!firstDone) {
		return false;
	}

	firstDone = false;
	
	await delay(100);

	showHidden(values.table.dealer);
	setScore(curStats, 'dealer');

	let count,
	result;

	while (curStats.dealer.score < 17) {
		count++;
		result = action(values.leftInDeck, values.table.dealer, 'dealer');
		values = {
		...values,
		...result
		};

		curStats.dealer.score = countScore(result.cards);
		setScore(curStats, 'dealer');
	}
	
	if (curStats.dealer.score > 21) {
		finishGame('dealerLost');

		curStats.player.money += 200;
		setMoney(curStats);
		checkMoney(curStats.player.money);

		document.getElementById('bid').classList.remove('hidden');
		continueGame = true;
		bidClicked = false;
	} else if (curStats.dealer.score > curStats.player.score) {
		finishGame('playerLost');

		if (curStats.player.money > 0) {
			document.getElementById('bid').classList.remove('hidden');
			continueGame = true;
			bidClicked = false;
		}
	} else if (curStats.dealer.score < curStats.player.score) {
		finishGame('dealerLost');

		if (curStats.player.score === 21 && values.table.player.length === 2)
			curStats.player.money += 300;
		else
			curStats.player.money += 200;

		setMoney(curStats);
		checkMoney(curStats.player.money);

		document.getElementById('bid').classList.remove('hidden');
		continueGame = true;
		bidClicked = false;
	} else if (curStats.dealer.score === curStats.player.score) {
		finishGame('draw');

		curStats.player.money += 100;
		setMoney(curStats);

		checkMoney(curStats.player.money);

		document.getElementById('bid').classList.remove('hidden');
		continueGame = true;
		bidClicked = false;
	}
});
