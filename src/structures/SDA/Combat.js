//WIP
class Combat extends PlayCard {
  attack(attacker, target, attackerOptions = {}, targetOptions = {}) {
    function manage(attacker, target, options = attackerOptions) {}

    function reaction(target, options = targetOptions) {
      function selfDefense() {}
      function counterAttack() {}
      function dodge() {}
    }
  }

  protect(savior, target, dice) {}

  utility(user, options = {} ?? undefined) {
    function useItem(item = options?.item) {}
    function ability(
      name = options?.name,
      target = options?.target ?? undefined
    ) {
      function heal(target = options?.target ?? undefined) {}
      function buff(target = options?.target ?? undefined) {}
    }
  }

  effect(effect, target) {
    function apply() {}
    function run() {}
  }
}
