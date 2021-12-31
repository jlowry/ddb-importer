import { baseSpellEffect, generateMacroChange, generateMacroFlags } from "../specialSpells.js";

export function heroismEffect(document) {
  let effectHeroismHeroism = baseSpellEffect(document, document.name);
  effectHeroismHeroism.changes.push({
    key: "data.traits.ci.value",
    value: "frightened",
    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
    priority: 20,
  });
  effectHeroismHeroism.flags.dae.macroRepeat = "startEveryTurn";
  const itemMacroText = `
//DAE Macro Execute, Effect Value = "Macro Name" t @damage (apply @mod damge of none type)
const lastArg = args[args.length - 1];
let tactor;
if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
else tactor = game.actors.get(lastArg.actorId);
const target = canvas.tokens.get(lastArg.tokenId)

let mod = args[1];

if (args[0] === "on") {
    ChatMessage.create({ content: \`Heroism is applied to \${tactor.name}\` })
}
if (args[0] === "off") {
    ChatMessage.create({ content: "Heroism ends" });
}
if(args[0] === "each"){
let bonus = mod > tactor.data.data.attributes.hp.temp ? mod : tactor.data.data.attributes.hp.temp
    tactor.update({ "data.attributes.hp.temp": mod });
    ChatMessage.create({ content: "Heroism continues on " + tactor.name })
}
`;
  document.flags["itemacro"] = generateMacroFlags(document, itemMacroText);
  effectHeroismHeroism.changes.push(generateMacroChange("@damage", 0));
  document.effects.push(effectHeroismHeroism);

  return document;
}
