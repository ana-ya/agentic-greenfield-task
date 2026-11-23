/* @ds-bundle: {"format":4,"namespace":"WeatherExplorer","components":[{"name":"Button"},{"name":"CitySearch"},{"name":"ComfortBadge"},{"name":"DayCard"},{"name":"WeekendHighlight"},{"name":"CompareTable"},{"name":"Notice"}]} */
(function () {
  var LEVELS = [
    { min: 70, level: "good", word: "Комфортно" },
    { min: 40, level: "fair", word: "Терпимо" },
    { min: 0, level: "poor", word: "Некомфортно" }
  ];
  function clamp(n) { n = Math.round(Number(n)); return isFinite(n) ? Math.max(0, Math.min(100, n)) : 0; }
  function comfortLevel(score) {
    var s = clamp(score);
    for (var i = 0; i < LEVELS.length; i++) if (s >= LEVELS[i].min) return LEVELS[i];
    return LEVELS[2];
  }
  function badgeHTML(score, size) {
    var s = clamp(score), l = comfortLevel(s);
    return '<span class="wx-badge wx-badge-' + l.level + (size === "lg" ? " wx-badge-lg" : "") + '" aria-label="Комфорт ' + s + ' зі 100, ' + l.word.toLowerCase() + '">' +
      '<span class="wx-score">' + s + '</span>' + l.word + '</span>';
  }
  var WEEKDAYS = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  function weekday(date) { return WEEKDAYS[new Date(date).getDay()]; }
  function temp(n) { return Math.round(n) + "°"; }
  var ns = window.WeatherExplorer || (window.WeatherExplorer = {});
  ns.comfortLevel = comfortLevel;
  ns.badgeHTML = badgeHTML;
  ns.weekday = weekday;
  ns.temp = temp;
  ns.LEVELS = LEVELS;
})();
