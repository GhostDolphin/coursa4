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
