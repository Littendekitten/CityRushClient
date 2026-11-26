const dictionary = new Map([
  ["RAKET", "ROCKET"],
  ["WASD = lopen · sleep = kijken · Shift = rennen · Spatie = springen · E = praten", "WASD = move · drag = look · Shift = sprint · Space = jump · E = talk"],
  ["🚀 NAAR DE MAAN!", "🚀 TO THE MOON!"],
  ["AANGEREDEN!", "HIT BY A CAR!"],
  ["Munten:", "Coins:"],
  ["Beste:", "Best:"],
  ["Je wilt naar de maan, maar een raket kost €100.000. Praat met mensen met een gele ! boven hun hoofd, doe hun missies (ongeveer 10, soms in gebouwen met een gouden deur: druk op E) en verdien het geld. Ontwijk onderweg het verkeer.", "You want to reach the moon, but a rocket costs €100,000. Talk to people with a yellow ! above their heads, complete their missions (about 10, sometimes inside buildings with a golden door: press E), and earn the money. Watch out for traffic along the way."],
  ["Computer: WASD/pijltjes lopen, muis slepen = kijken, Shift = rennen, Spatie = springen, E = praten.", "Computer: WASD/arrow keys = move, drag mouse = look, Shift = sprint, Space = jump, E = talk."],
  ["Telefoon (PRAAT-knop om te praten): linkerhelft slepen = lopen, rechterhelft slepen = kijken.", "Phone (TALK button to talk): drag the left half = move, drag the right half = look."],
  ["Klik om te starten", "Click to start"],
  ["Beste score: ", "Best score: "],
  ["Druk op E (of PRAAT) om te praten", "Press E (or TALK) to talk"],
  ["Druk op E om het gebouw in te gaan", "Press E to enter the building"],
  ["Druk op E om naar binnen te gaan", "Press E to go inside"],
  ["Druk op E om naar buiten te gaan", "Press E to go outside"],
  ["Je bent binnen! Praat met de baas (E).", "You're inside! Talk to the boss (E)."],
  ["E = naar buiten", "E = exit"],
  ["E = praten met de baas", "E = talk to the boss"],
  ["Dit is het verkeerde gebouw! Zoek de gouden deur met de lichtpilaar.", "This is the wrong building! Find the golden door with the light pillar."],
  ["Bedankt! Alles klopt. Loop naar de deur en druk op E om naar buiten te gaan, dan krijg je je geld.", "Thanks! Everything checks out. Walk to the door and press E to go outside; then you'll receive your money."],
  ["Hallo! Kom later nog eens langs.", "Hello! Come back another time."],
  ["Aangereden! Missie mislukt.", "Hit by a car! Mission failed."],
  ["Te laat! Missie mislukt.", "Too late! Mission failed."],
  ["ZIEKENHUIS  -€1.000", "HOSPITAL  -€1,000"],
  ["Je hebt de raket betaald met je missies. Goed gedaan!", "You paid for the rocket with your missions. Well done!"],
  ["Klik om opnieuw te spelen", "Click to play again"],
  ["zoek iemand met een !", "find someone with a !"],
  ["pakjes", "packages"],
  ["overleef", "survive"],
  ["ga naar de gouden deur", "go to the golden door"],
  ["verlaat het gebouw", "leave the building"],
  ["praat met de baas", "talk to the boss"],
  ["bij de deur", "at the door"],
  ["Missie ", "Mission "],
  ["mislukt", "failed"],
  ["Breng dit pakketje naar het gebouw met de gouden deur en geef het aan de baas. Druk bij de deur op E!", "Take this package to the building with the golden door and give it to the boss. Press E at the door!"],
  ["Ik ben vier pakjes kwijt. Kun je ze zoeken?", "I've lost four packages. Can you find them?"],
  ["Loop 25 seconden rond zonder aangereden te worden. Ik film het!", "Walk around for 25 seconds without getting hit by a car. I'm recording!"],
  ["Mijn vriend werkt in het gebouw met de gouden deur. Haal mijn jas bij hem op!", "My friend works in the building with the golden door. Pick up my coat from him!"],
  ["Mijn folders zijn weggewaaid. Pak er 5!", "My flyers blew away. Collect 5!"],
  ["Race naar de plek! Je hebt 40 seconden.", "Race to the location! You have 40 seconds."],
  ["Lever dit geheime pakket af bij de gouden deur. Laat het aan niemand zien!", "Deliver this secret package to the golden door. Don't show it to anyone!"],
  ["Verkeerstest: 35 seconden zonder schade.", "Traffic test: 35 seconds without taking damage."],
  ["Spoedlevering! Je hebt 35 seconden.", "Urgent delivery! You have 35 seconds."],
  ["Laatste klus: zoek 6 onderdelen voor mijn raketmotor!", "Final job: find 6 parts for my rocket engine!"]
]);

function translateText(value) {
  const text = String(value ?? "");
  const trailingWhitespace = text.match(/\s+$/)?.[0] || "";
  let result = trailingWhitespace ? text.slice(0, -trailingWhitespace.length) : text;
  if (dictionary.has(result)) return dictionary.get(result) + trailingWhitespace;
  // Score labels can include a dynamic value and the source node may carry trailing whitespace.
  result = result.replace(/^Beste score:\s*(.*)$/, "Best score: $1");
  // Mission status is generated dynamically, so translate its numbers and counters too.
  result = result.replace(/^Missie (\d+)\/10: zoek iemand met een !$/, "Mission $1/10: find someone with a !");
  result = result.replace(/^Missie (\d+)\/10: pakjes (\d+)\/(\d+)$/, "Mission $1/10: packages $2/$3");
  result = result.replace(/^Missie (\d+)\/10: overleef (\d+)s$/, "Mission $1/10: survive $2s");
  result = result.replace(/^Missie (\d+)\/10: ga naar de gouden deur (.+)m \(E\)$/, "Mission $1/10: go to the golden door $2m (E)");
  result = result.replace(/^Missie (\d+)\/10: verlaat het gebouw \(E bij de deur\)$/, "Mission $1/10: leave the building (E at the door)");
  result = result.replace(/^Missie (\d+)\/10: praat met de baas \(E\)$/, "Mission $1/10: talk to the boss (E)");
  result = result.replace(/^Missie (\d+)\/10: (\d+)m(?: · (\d+)s)?$/, (_, n, distance, seconds) => `Mission ${n}/10: ${distance}m${seconds ? ` · ${seconds}s` : ""}`);
  result = result.replace(/^Extra klus nodig voor het geld$/, "Extra jobs needed for the money");
  return result + trailingWhitespace;
}

function translateSubtree(root) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const translated = translateText(node.nodeValue);
    if (translated !== node.nodeValue) node.nodeValue = translated;
  }
}

export default {
  id: "better-translations",
  name: "BetterTranslations",
  description: "Translates the CityRush interface and mission text into English.",
  init(api) {
    document.documentElement.lang = "en";
    translateSubtree(document.body);
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === "characterData") {
          const node = record.target;
          const translated = translateText(node.nodeValue);
          if (translated !== node.nodeValue) node.nodeValue = translated;
        } else {
          for (const node of record.addedNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
              const translated = translateText(node.nodeValue);
              if (translated !== node.nodeValue) node.nodeValue = translated;
            } else if (node.nodeType === Node.ELEMENT_NODE) translateSubtree(node);
          }
        }
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    api.translationsEnabled = true;
  }
};
