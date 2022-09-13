import 'dotenv/config';

export const [prefix, token] = await import('../../config.json', {
  assert: {type: 'json'}
})
  .then(config => {
    console.log('Using config.json.');
    return [config.default.PREFIX, config.default.TOKEN];
  })
  .catch(() => {
    console.log('Using environment variables.');
    return [process.env.PREFIX, process.env.TOKEN];
  });

// GUILD SPECIFIC CONFIGURATION FOR THE BOT: Most, if not all commands will use these credentials, so make sure you set them up. Since Moniqueta's a roleplaying tool, it depends on these. We might let you do stuff without these later on, using plain database queries but this is far from our plans now.
export const myGuild = '976870103125733388';
export const categories = {
  arquivo: '977086756459511808',
  rpCategories: [
    '981349204792324118',
    '981349346937282630',
    '981351342880751647',
    '981352508838518784',
    '981352771171254272',
    '996538254268584056',
    '981351861837762561',
    '981351960722698240',
    '981351678290833460',
    '981353923241738250',
    '981354003726221335',
    '994663834415550496',
    '981348652918398986'
  ]
};
export const channels = {
  rpRegistro: '977090435845603379', // where users will register their characters
  adminFichaRegistro: '986952888930697266', // where admins will check the sheets
  rpFichas: '977090263438745620', // where the sheets will be stored when approved
  rolesChannel: '977068675343450133', // where the role selector is placed.
  entranceChannel: '976880373118148678', // the place where the bot will run the "captcha" check.
  generalChannel: '977081396839448596', // the general channel of the guild.
  mediaChannel: '977083633435279390', // the channel where the bot will upload media which was moderated.
  memberCounter: '977082930402844692', // the channel where the bot will count the members.
  loginoutChannel: '977087066129174538', // the channel where the bot will log users in and out.
  errorChannel: '997289513850261554', // the channel where the bot will log errors.
  postCounter: '977083043011506196', // the channel where the bot will count the posts.
  charCounter: '1008888230973820958', // the channel where the bot will count the characters.
  sdcPremiadosChannel: '1014741972541509683' // the channel where the bot will post the SDC premiados.
};
export const roles = {
  entranceRole: '983190321334726666', // the role which will be given to the user when they join the guild.
  welcomeRole: '977087122345451530', // Role given to members that volunteered to cheer up newcomers.
  xpBoostRole: '1004817937078702101'
};
