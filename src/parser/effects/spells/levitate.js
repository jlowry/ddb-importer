import { baseSpellEffect, generateMacroChange, generateMacroFlags } from "../specialSpells.js";

export function levitateEffect(document) {
  let effect = baseSpellEffect(document, document.name);
  // MACRO START
  const itemMacroText = `
//DAE Item Macro, no arguments passed
if (!game.modules.get("advanced-macros")?.active) ui.notifications.error("Please enable the Advanced Macros module")
const lastArg = args[args.length - 1];
let tactor;
const target = canvas.tokens.get(lastArg.tokenId)

if (args[0] === "on") {
    ChatMessage.create({ content: \`\${target.name} is levitated 20ft\` });
    target.update({ "elevation": 20 });
}
if (args[0] === "off") {
    target.update({"elevation": 0 });
    ChatMessage.create({ content: \`\${target.name} is returned to the ground\` });
}
`;
  // MACRO STOP
  document.flags["itemacro"] = generateMacroFlags(document, itemMacroText);
  effect.changes.push(generateMacroChange("", 0));
  document.effects.push(effect);

  return document;
}
