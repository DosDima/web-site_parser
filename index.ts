import parseLinks from "./src/parseLinks";
import parseIDs from "./src/parseIDs";
import parseProsucts from "./src/parseProsucts";

(async () => {
  // "1" - Мотоцикл
  // "2" - Квадроцикл
  // "4" - Скутер
  // "5" - Снегоход
  if (!(await parseIDs("1"))) return;
  if (!(await parseLinks())) return;
  if (!(await parseProsucts())) return;
})();
