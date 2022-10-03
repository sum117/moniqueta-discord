export class Dnd {

    public static proficiencyBonus(charLevel: number) {
      return 2 + (charLevel - 1) / 4;
    }

    public static skillModifier(skillLevel: number) {
      return (skillLevel - 10) / 2;
    }

    public static hitCheck(
      isProficiencyApplicable: boolean,
      charLevel: number,
      skillLevel: number,
    ): number {
      const d20 = Math.floor(Math.random() * 20) + 1;
      return (
        d20 +
        (isProficiencyApplicable ? this.proficiencyBonus(charLevel) : 0) +
        this.skillModifier(skillLevel)
      );
    }

    public static canAttack(hitCheckResult: number, armorClass: number) {
      return hitCheckResult > armorClass;
    }

    public static handleDamageHeal(weaponSpellDice: string, skillSpellLevel?: number) {
      const [dice, sides] = weaponSpellDice.split('d').map(Number);
      let damage = 0;
      for (let i = 0; i < dice; i++) {
        damage += Math.floor(Math.random() * sides) + 1;
      }
      return damage + (skillSpellLevel ? this.skillModifier(skillSpellLevel) : 0);
    }


  }
