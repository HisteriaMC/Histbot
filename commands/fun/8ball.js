const list = [
    "Probablement.",
    "Je pense bien que oui.",
    "Hmmm après avoir réfléchi, je dirais que non.",
    "Hmmm après avoir réfléchi, je dirais que oui.",
    "C'est évident, non.",
    "Probablement pas.",
    "C'est évident, oui.",
    "Effectivement",
    "Je pense que oui... attends j’ai un doute, à mon avis.... non en fait",
    "Il y a certaines choses auxquelles je ne peut pas répondre",
    "Je pourrais te répondre, mais je n'en ai pas envie.",
    "Entre nous, je ne pense pas.",
    "Je n'ai qu'une chose a répondre... OUI !",
    "Je n'ai point d'avis sur cela.",
    "Tu devrais demander à Speedy.",
    "Tu devrais demander à Raznov.",
    "Ça reste entre nous, mais je pense que tu as raison !" ,
    "Sans aucun doute.",
    "Très probable.",
    "C'est bien parti.",
    "Une chance sur deux.",
    "C'est le destin qui le dira.",
    "C'est certain.",
    "Faut pas rêver.",
    "N'y compte pas.",
    "Impossible.",
    "D'après moi c'est oui.",
    "P'tetre oui, p'tetre non !",
    "P’têt ben qu’oui, p’têt ben qu’non"
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
