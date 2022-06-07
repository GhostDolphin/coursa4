const CARD_TEMPLATE = `<tr class="up num"><td><span></span></td></tr><tr class="up suit"><td><span></span></td></tr><tr class="mid"><td></td></tr><tr class="down suit"><td><span></span></td></tr><tr class="down num"><td><span></span></td></tr>`;

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

const parseCardClass = (isHidden, card) => isHidden ? ` hidden` : ` ${card.suit} num${card.value}`;

const startGame = (deck, stats) => {
	const values = {
		leftInDeck: deck,
		table: {
			player: [],
			dealer: []
		},
		counter: 0
	};


	for (let i = 0; i < 2; i++) {
		for (const side in values.table) {
			values.counter++;
			values.table[side].push(...values.leftInDeck.splice(0, 1));
			const newCard = document.getElementById(`card_${side}_${i}`),
			className = parseCardClass((i === 1) && (side === 'dealer') ? true : false, values.table[side][i]);
			newCard.className += className;
			setTimeout(() => {
				document.getElementById(newCard.id).style.transform = 'scale(1)';
			}, 1000 * values.counter);
		}
	}

	document.getElementById('chip').innerHTML = '$100';
	return values;
};
