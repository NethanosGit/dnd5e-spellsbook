// © Copyright 2019 Bruno Giorello. Released under GNU AGPLv3, see 'LICENSE.md'.

// This static class handles some text transformations to make descriptions prettier
class TextBeautifier {
  // Colorize different keyword types within the text
  static colorize(text) {
    for (let sub of this.substitutions) {
      text = text.replace(sub[0], sub[1]);
    }
    return text;
  }

  // Add the average of multi-die rolls as ruby text
  static addDieAverages(text) {
    /*for (let match of text.matchAll(/<span class="sx-die">(.*?)<\/span>/g)) {
      const parts = match[1].split("d");
      const amount = parseInt(parts[0]);
      if (!amount || amount < 2) continue;
      const sides = parseInt(parts[1]);
      text = text.replace(
        match[0],
        `<span class="sx-die"><ruby>${match[1]}<rt>${
          (amount * (sides + 1)) / 2
        }</rt></ruby></span>`
      );
    }*/
    return text;
  }

  // Add the 'table' class to tables for bootstrap CSS formatting
  static styleTables(text) {
    if (text.includes("<table>")) {
      return text.replace(/<table>/g, '<table class="table">');
    }
    return text;
  }

  static addRuleLinks(text) {
    return text.replace(
      this.rulesRegex,
      '<span class="dynamic-link">$1</span>'
    );
  }

  // Apply all transformations
  static beautify(text) {
    return this.styleTables(
      this.addDieAverages(this.colorize(this.addRuleLinks(text)))
    );
  }
}
TextBeautifier.substitutions = [
  [/([\d,]+[- ](f[eo]{2}t|miles?))/g, '<span class="sx-distance">$1</span>'],
  [
    /(\d+[- ](rounds?|hours?|minutes?|days?))/g,
    '<span class="sx-time">$1</span>',
  ],
  [/(\d+[- ](pounds?))/g, '<span class="sx-weight">$1</span>'],
  [
    /(DC|(([Ss]trength|[Dd]exterity|[Cc]onstitution|[Ii]ntelligence|[Ww]isdom|[Cc]harisma)? saving throws?)|\w*? \(\w+?\) checks?)/g,
    '<span class="sx-sthrow">$1</span>',
  ],
  [/([^\w](advantage)[^\w])/g, '<span class="sx-advantage">$1</span>'],
  [/([^\w](disadvantage)[^\w])/g, '<span class="sx-disadvantage">$1</span>'],
  [
    /(\d+d\d+)\s+([Bb]ludgeoning\s+damage)/g,
    '<span class="sx-weapon">$1<img src="https://bg3.wiki/w/images/thumb/7/7d/Bludgeoning_Damage_Icon.png/30px-Bludgeoning_Damage_Icon.png">$2</span>',
  ],
  [
    /(\d+d\d+)\s+([Pp]iercing\s+damage)/g,
    '<span class="sx-weapon">$1<img src="https://bg3.wiki/w/images/thumb/0/0b/Piercing_Damage_Icon.png/30px-Piercing_Damage_Icon.png">$2</span>',
  ],
  [
    /(\d+d\d+)\s+([Ss]lashing\s+damage)/g,
    '<span class="sx-weapon">$1<img src="https://bg3.wiki/w/images/thumb/f/f0/Slashing_Damage_Icon.png/30px-Slashing_Damage_Icon.png">$2</span>',
  ],
  [
    /(\d+d\d+)\s+([Cc]old\s+damage)/g,
    '<span class="sx-cold">$1<img src="https://bg3.wiki/w/images/thumb/0/05/Cold_Damage_Icon.png/30px-Cold_Damage_Icon.png">$2</span>',
  ],
  [
    /(\d+d\d+)\s+([Ff]orce\s+damage)/g,
    '<span class="sx-force">$1<img src="https://bg3.wiki/w/images/thumb/d/d1/Force_Damage_Icon.png/30px-Force_Damage_Icon.png">$2</span>',
  ],
  [
    /(\d+d\d+)\s+([Ff]ire\s+damage)/g,
    '<span class="sx-fire">$1<img src="https://bg3.wiki/w/images/thumb/8/84/Fire_Damage_Icon.png/30px-Fire_Damage_Icon.png">$2</span>',
  ],
  [
    /(\d+d\d+)\s+([Tt]hunder\s+damage)/g,
    '<span class="sx-thunder">$1<img src="https://bg3.wiki/w/images/thumb/8/87/Thunder_Damage_Icon.png/30px-Thunder_Damage_Icon.png">$2</span>',
  ],
  [
    /(\d+d\d+)\s+([Ll]ightning\s+damage)/g,
    '<span class="sx-lightning">$1<img src="https://bg3.wiki/w/images/thumb/3/31/Lightning_Damage_Icon.png/30px-Lightning_Damage_Icon.png">$2</span>',
  ],
  [
    /(\d+d\d+)\s+([Aa]cid\s+damage)/g,
    '<span class="sx-acid">$1<img src="https://bg3.wiki/w/images/thumb/5/5f/Acid_Damage_Icon.png/30px-Acid_Damage_Icon.png">$2</span>',
  ],
  [
    /(\d+d\d+)\s+([Pp]oison\s+damage)/g,
    '<span class="sx-poison">$1<img src="https://bg3.wiki/w/images/thumb/5/55/Poison_Damage_Icon.png/30px-Poison_Damage_Icon.png">$2</span>',
  ],
  [
    /(\d+d\d+)\s+([Rr]adiant\s+damage)/g,
    '<span class="sx-radiant">$1<img src="https://bg3.wiki/w/images/thumb/7/78/Radiant_Damage_Icon.png/30px-Radiant_Damage_Icon.png">$2</span>',
  ],
  [
    /(\d+d\d+)\s+([Nn]ecrotic\s+damage)/g,
    '<span class="sx-necrotic">$1<img src="https://bg3.wiki/w/images/thumb/3/39/Necrotic_Damage_Icon.png/30px-Necrotic_Damage_Icon.png">$2</span>',
  ],
  [
    /(\d+d\d+)\s+([Pp]sychic\s+damage)/g,
    '<span class="sx-psychic">$1<img src="https://bg3.wiki/w/images/thumb/0/04/Psychic_Damage_Icon.png/30px-Psychic_Damage_Icon.png">$2</span>',
  ],
  [/((melee|ranged)( spell)? attacks?)/g, '<span class="sx-attack">$1</span>'],
  [/\bby\s(\d*?d\d+)/g, 'by <span class="sx-die">$1</span>'],
  [/(\b(\d*?d\d+)\b)/g, '<span class="sx-die">$1</span>'],
];
TextBeautifier.rulesRegex =
  /(blinded|blindsight|bright light|charmed|darkvision|deafened|dim light|exhaustion|frightened|heavily obscured|grappled|incapacitated|invisible|lightly obscured|paralyzed|petrified|poisoned|prone|restrained|stunned|truesight|unconscious)/g;
export default TextBeautifier;
