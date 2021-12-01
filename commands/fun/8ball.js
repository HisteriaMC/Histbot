const list = [
    "Probablement.",
    "Je pense bien que oui.",
    "Hmmm après avoir réfléchis, je dirais que non.",
    "Hmmm après avoir réfléchis, je dirais que oui.",
    "C'est évident, non.",
    "Probablement pas.",
    "C'est évident, oui.",
    "Effectivement",
    "Je pense que oui, mais enfaite j’ai un doute, à mon avis.... non en fait"
];

module.exports.run = async(client, message) => {
    message.reply(list[Math.floor(Math.random() * (list.length))]);
};

module.exports.config = {
    name: "8ball",
    description: "Donne une réponse oui/non aléatoirement",
    format: "8ball [votre message fun]",
    canBeUseByBot: false,
    category: "Fun"
};
