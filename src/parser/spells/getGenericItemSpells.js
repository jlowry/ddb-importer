import { fixSpells } from "./special.js";
import { parseSpell } from "./parseSpell.js";


export function getGenericItemSpells(itemList, itemSpells) {
  let items = [];

  // feat spells are handled slightly differently
  itemSpells.forEach((spell) => {
    if (!spell.definition) return;

    const itemInfo = itemList.find((it) => it.definition.id === spell.componentId);
    if (!itemInfo) return;

    const active
      = (!itemInfo.definition.canEquip && !itemInfo.definition.canAttune) // if item just gives a thing
      || itemInfo.isAttuned // if it is attuned (assume equipped)
      || (!itemInfo.definition.canAttune && itemInfo.equipped); // can't attune but is equipped
    // for item spells the spell dc is often on the item spell
    let spellDC = null;
    if (spell.overrideSaveDc) {
      spellDC = spell.overrideSaveDc;
    }

    // add some data for the parsing of the spells into the data structure
    spell.flags = {
      ddbimporter: {
        dndbeyond: {
          lookup: "item",
          lookupName: itemInfo.definition.name,
          lookupId: itemInfo.definition.id,
          level: spell.castAtLevel,
          dc: spellDC,
          limitedUse: itemInfo.limitedUse,
          nameOverride: `${spell.definition.name} (${itemInfo.definition.name})`,
          overrideDC: !!spell.overrideSaveDc,
          spellLimitedUse: spell.limitedUse,
          castAtLevel: spell.castAtLevel,
          active: active,
        },
      },
    };

    items.push(parseSpell(spell, null));
  });

  if (items) fixSpells(null, items);

  return items;
}
